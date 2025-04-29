import express from 'express';
import cors from 'cors';
import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const readFile = promisify(fs.readFile);

async function readCSVFile(filename: string): Promise<any[]> {
  try {
    const filePath = path.join(__dirname, '../../files', filename);
    const fileContent = await readFile(filePath, 'utf-8');
    
    return new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        cast: true
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  } catch (error) {
    console.error(`Erreur lors de la lecture du fichier ${filename}:`, error);
    throw error;
  }
}

// Route pour récupérer la liste des pays
app.get('/api/countries', async (req, res) => {
  try {
    const data = await readCSVFile('countries_and_continents.csv');
    const countries = data.map(row => ({
      name: row.country,
      continent: row.continent
    })).sort((a, b) => a.name.localeCompare(b.name));
    res.json(countries);
  } catch (error) {
    console.error('Erreur lors de la récupération des pays:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer les données de population
app.get('/api/population/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const data = await readCSVFile('millions_population_country.csv');
    const countryData = data.find(row => row.country.toLowerCase() === country.toLowerCase());
    
    if (!countryData) {
      return res.status(404).json({ error: 'Pays non trouvé' });
    }

    const populationData = {
      country: countryData.country,
      years: {
        '2018': countryData['2018'],
        '2019': countryData['2019'],
        '2020': countryData['2020'],
        '2021': countryData['2021'],
        '2022': countryData['2022'],
        '2023': countryData['2023']
      }
    };

    res.json(populationData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données de population:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer les données de vaccination
app.get('/api/vaccinations/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const data = await readCSVFile('vaccinations.csv');
    const countryData = data.filter(row => row.country.toLowerCase() === country.toLowerCase());
    
    if (countryData.length === 0) {
      return res.status(404).json({ error: 'Données de vaccination non trouvées pour ce pays' });
    }

    const vaccinationData = countryData.map(row => ({
      date: row.date,
      total_vaccinations: row.total_vaccinations,
      people_vaccinated: row.people_vaccinated,
      people_fully_vaccinated: row.people_fully_vaccinated,
      daily_vaccinations: row.daily_vaccinations
    }));

    res.json(vaccinationData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données de vaccination:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer les données filtrées
app.post('/api/data', async (req, res) => {
  try {
    const { diseases, metrics, countries, startDate, endDate } = req.body;
    const data: any = {};

    for (const country of countries) {
      data[country] = {};
      
      // Récupération des données COVID-19
      if (diseases.includes('Covid19')) {
        const covidData = await getCovidData(metrics, [country], startDate, endDate);
        data[country].covid = covidData;
      }

      // Récupération des données Variole du Singe
      if (diseases.includes('Variole du Singe')) {
        const monkeypoxData = await getMonkeypoxData(metrics, [country], startDate, endDate);
        data[country].monkeypox = monkeypoxData;
      }

      // Ajout des données de population si demandées
      if (metrics.includes('Population')) {
        const populationData = await getPopulationData([country]);
        data[country].population = populationData;
      }

      // Ajout des données de vaccination si demandées
      if (metrics.includes('Vaccinations')) {
        const vaccinationData = await getVaccinationData([country], startDate, endDate);
        data[country].vaccinations = vaccinationData;
      }
    }

    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

async function getCovidData(metrics: string[], countries: string[], startDate: string, endDate: string) {
  const data = await readCSVFile('worldometer_coronavirus_daily_data.csv');
  let filteredData = data;
  
  if (startDate) {
    filteredData = filteredData.filter((row: any) => row.date >= startDate);
  }
  
  if (endDate) {
    filteredData = filteredData.filter((row: any) => row.date <= endDate);
  }

  return processData(filteredData, metrics, countries[0]);
}

async function getMonkeypoxData(metrics: string[], countries: string[], startDate: string, endDate: string) {
  const data = await readCSVFile('owid_monkeypox_data.csv');
  let filteredData = data;
  
  if (startDate) {
    filteredData = filteredData.filter((row: any) => row.date >= startDate);
  }
  
  if (endDate) {
    filteredData = filteredData.filter((row: any) => row.date <= endDate);
  }

  return processData(filteredData, metrics, countries[0]);
}

async function getPopulationData(countries: string[]) {
  const data = await readCSVFile('millions_population_country.csv');
  
  let filteredData = data;
  if (countries.length > 0) {
    filteredData = filteredData.filter((row: any) => countries.includes(row.country));
  }

  return filteredData.map(row => ({
    country: row.country,
    population: {
      '2018': row['2018'],
      '2019': row['2019'],
      '2020': row['2020'],
      '2021': row['2021'],
      '2022': row['2022'],
      '2023': row['2023']
    }
  }));
}

async function getVaccinationData(countries: string[], startDate: string, endDate: string) {
  const data = await readCSVFile('vaccinations.csv');
  
  let filteredData = data;
  
  if (countries.length > 0) {
    filteredData = filteredData.filter((row: any) => countries.includes(row.country));
  }
  
  if (startDate) {
    filteredData = filteredData.filter((row: any) => row.date >= startDate);
  }
  
  if (endDate) {
    filteredData = filteredData.filter((row: any) => row.date <= endDate);
  }

  return filteredData.map(row => ({
    country: row.country,
    date: row.date,
    total_vaccinations: row.total_vaccinations,
    people_vaccinated: row.people_vaccinated,
    people_fully_vaccinated: row.people_fully_vaccinated,
    daily_vaccinations: row.daily_vaccinations
  }));
}

function processData(rows: any[], metrics: string[], country: string) {
  const countryData = rows.filter(row => row.country === country || row.location === country);
  const dates = [...new Set(countryData.map(row => row.date))].sort();
  
  const data: any = {
    dates,
  };

  metrics.forEach(metric => {
    data[metric] = dates.map(date => {
      const row = countryData.find(r => r.date === date);
      if (!row) return 0;
      switch (metric) {
        case 'Cas actifs':
          return row.active_cases || (row.total_cases - row.total_deaths) || 0;
        case 'Décès':
          return row.daily_new_deaths || row.new_deaths || 0;
        case 'Total des cas':
          return row.cumulative_total_cases || row.total_cases || 0;
        case 'Total des morts':
          return row.cumulative_total_deaths || row.total_deaths || 0;
        case 'Nouveaux cas':
          return row.daily_new_cases || row.new_cases || 0;
        case 'Population':
          return row.population || 0;
        case 'Vaccinations':
          return row.total_vaccinations || 0;
        default:
          return 0;
      }
    });
  });

  return data;
}

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
}); 