import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export async function readCSVFile(filename: string): Promise<any[]> {
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

export async function getCovidData(metrics: string[], countries: string[], startDate: string, endDate: string) {
  const data = await readCSVFile('worldometer_coronavirus_daily_data.csv');
  
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

  return processData(filteredData, metrics);
}

export async function getMonkeypoxData(metrics: string[], countries: string[], startDate: string, endDate: string) {
  const data = await readCSVFile('owid_monkeypox_data.csv');
  
  let filteredData = data;
  
  if (countries.length > 0) {
    filteredData = filteredData.filter((row: any) => countries.includes(row.location));
  }
  
  if (startDate) {
    filteredData = filteredData.filter((row: any) => row.date >= startDate);
  }
  
  if (endDate) {
    filteredData = filteredData.filter((row: any) => row.date <= endDate);
  }

  return processData(filteredData, metrics);
}

export async function getCountries(): Promise<any[]> {
  const data = await readCSVFile('countries_and_continents.csv');
  return data.map((row: any) => ({
    name: row.country,
    continent: row.continent
  }));
}

function processData(rows: any[], metrics: string[]) {
  const dates = [...new Set(rows.map(row => row.date))].sort();
  const data: any = {
    dates,
  };

  metrics.forEach(metric => {
    data[metric] = dates.map(date => {
      const row = rows.find(r => r.date === date);
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
        default:
          return 0;
      }
    });
  });

  return data;
} 