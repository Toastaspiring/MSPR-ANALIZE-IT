import React, { useState, useEffect } from 'react';
import { Container, Button, Box, CircularProgress, Typography, Paper, AppBar, Toolbar, IconButton, useTheme, Grid, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { useTranslation } from '../hooks/useTranslation';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import FilterPopup, { FilterData } from '../components/FilterPopup';
import Graph from '../components/Graph';
import DataTable from '../components/DataTable';
import MetricsSummary from '../components/MetricsSummary';
import Predictions from '../components/Predictions';
import { getFilteredReportCases, getPredictions, PredictionResult } from '../services/api';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useLanguage } from '../contexts/LanguageContext';

interface DataPoint {
  date: string;
  value: number;
  metric: string;
  country: string;
  disease: string;
}

const Dashboard: React.FC = () => {
  const { t, language } = useTranslation();
  const { country } = useLanguage();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterData | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const theme = useTheme();

  // Mapping inverse pour les maladies et métriques traduites
  const diseaseMap: Record<string, string> = {
    [t('diseases.covid19')]: 'Covid19',
    [t('diseases.monkeypox')]: 'Variole du Singe',
    'Covid19': 'Covid19',
    'Variole du Singe': 'Variole du Singe',
    'Monkeypox': 'Variole du Singe',
  };
  const metricMap: Record<string, string> = {
    [t('metrics.activeCases')]: 'Cas actifs',
    [t('metrics.deaths')]: 'Décès',
    [t('metrics.totalCases')]: 'Total des cas',
    [t('metrics.totalDeaths')]: 'Total des morts',
    [t('metrics.newCases')]: 'Nouveaux cas',
    [t('metrics.population')]: 'Population',
    [t('metrics.vaccinations')]: 'Vaccinations',
    'Cas actifs': 'Cas actifs',
    'Décès': 'Décès',
    'Total des cas': 'Total des cas',
    'Total des morts': 'Total des morts',
    'Nouveaux cas': 'Nouveaux cas',
    'Population': 'Population',
    'Vaccinations': 'Vaccinations',
    'Active Cases': 'Cas actifs',
    'Deaths': 'Décès',
    'Total Cases': 'Total des cas',
    'Total Deaths': 'Total des morts',
    'New Cases': 'Nouveaux cas'
  };
  // Mapping inverse pour les maladies, métriques et pays traduits
  const countryMap: Record<string, string> = {
    'France': 'France',
    'Suisse': 'Suisse',
    'US': 'US',
    'United States': 'US',
    'États-Unis': 'US',
    [t('countries.france')]: 'France',
    [t('countries.switzerland')]: 'Suisse',
    [t('countries.us')]: 'US'
  };

  // --- Chargement initial des données selon le pays ---
  useEffect(() => {
    if (country === 'Suisse') {
      // Mode Suisse : charger toutes les données au montage
      setLoading(true);
      setError(null);
      (async () => {
        try {
          const filters = {
            diseases: ['Covid19', 'Variole du Singe'],
            metrics: ['Cas actifs', 'Décès', 'Total des cas', 'Total des morts', 'Nouveaux cas', 'Population', 'Vaccinations'],
            countries: ['France', 'Suisse', 'US'],
            startDate: '',
            endDate: ''
          };
          const response = await getFilteredReportCases(filters);
          const transformedData: DataPoint[] = [];
          Object.entries(response).forEach(([country, countryData]: [string, any]) => {
            // Données COVID
            if (countryData.covid) {
              Object.entries(countryData.covid).forEach(([metric, data]: [string, any]) => {
                if (metric !== 'dates') {
                  countryData.covid.dates.forEach((date: string, index: number) => {
                    transformedData.push({
                      date,
                      value: data[index],
                      metric,
                      country,
                      disease: 'Covid19'
                    });
                  });
                }
              });
            }
            // Données Variole du Singe
            if (countryData.monkeypox) {
              Object.entries(countryData.monkeypox).forEach(([metric, data]: [string, any]) => {
                if (metric !== 'dates') {
                  countryData.monkeypox.dates.forEach((date: string, index: number) => {
                    transformedData.push({
                      date,
                      value: data[index],
                      metric,
                      country,
                      disease: 'Variole du Singe'
                    });
                  });
                }
              });
            }
          });
          setData(transformedData);
        } catch (err) {
          setError('Erreur lors du chargement des données');
        } finally {
          setLoading(false);
        }
      })();
    } else {
      // Mode France/US : charger des données par défaut pour afficher la dataviz
      setLoading(true);
      setError(null);
      (async () => {
        try {
          const defaultFilters = {
            diseases: ['Covid19'],
            metrics: ['Cas actifs', 'Décès', 'Nouveaux cas'],
            countries: [country], // Utiliser le pays actuel
            startDate: '',
            endDate: '',
            timeGrouping: 'day' as const
          };
          await handleApplyFilters(defaultFilters);
        } catch (err) {
          setError('Erreur lors du chargement des données');
          setLoading(false);
        }
      })();
    }
  }, [country]);

  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    '#FF6B6B',  // Rouge corail
    '#4ECDC4',  // Turquoise
    '#45B7D1',  // Bleu clair
    '#96CEB4',  // Vert menthe
    '#FFEEAD',  // Jaune pâle
    '#D4A5A5',  // Rose poudré
    '#9B59B6',  // Violet
    '#3498DB',  // Bleu
    '#E67E22',  // Orange
    '#2ECC71'   // Vert
  ];

  const handleApplyFilters = async (filters: FilterData) => {
    setLoading(true);
    setError(null);
    setCurrentFilters(filters);
    try {
      // Mapping inverse des maladies, métriques et pays
      const mappedFilters = {
        ...filters,
        diseases: filters.diseases.map(d => diseaseMap[d] || d),
        metrics: filters.metrics.map(m => metricMap[m] || m),
        countries: filters.countries.map(c => countryMap[c] || c)
      };
      const response = await getFilteredReportCases(mappedFilters);
      const transformedData: DataPoint[] = [];
      Object.entries(response).forEach(([country, countryData]: [string, any]) => {
        // Données COVID
        if (countryData.covid) {
          Object.entries(countryData.covid).forEach(([metric, data]: [string, any]) => {
            if (metric !== 'dates') {
              countryData.covid.dates.forEach((date: string, index: number) => {
                transformedData.push({
                  date,
                  value: data[index],
                  metric,
                  country,
                  disease: 'Covid19'
                });
              });
            }
          });
        }
        // Données Variole du Singe
        if (countryData.monkeypox) {
          Object.entries(countryData.monkeypox).forEach(([metric, data]: [string, any]) => {
            if (metric !== 'dates') {
              countryData.monkeypox.dates.forEach((date: string, index: number) => {
                transformedData.push({
                  date,
                  value: data[index],
                  metric,
                  country,
                  disease: 'Variole du Singe'
                });
              });
            }
          });
        }
      });
      setData(transformedData);

      // Récupération des prédictions
      const singleCountry = filters.countries && filters.countries.length === 1;
      const singleDisease = filters.diseases && filters.diseases.length === 1;
      const hasActiveMetric = filters.metrics.includes('Cas actifs');

      if (singleCountry && singleDisease && hasActiveMetric) {
        const predictionData = {
          inhabitantsNumber: 1000000,
          vaccinationRate: 0.7,
          diseaseId: filters.diseases[0] === 'Covid19' ? 1 : 2,
          localizationId: 1,
          day_of_week: new Date().getDay(),
          month: new Date().getMonth() + 1
        };

        const predictionResults = getPredictions(predictionData);
        setPredictions(predictionResults);
      } else {
        setPredictions([]);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setError('Une erreur est survenue lors de la récupération des données.');
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const getMetricsForSummary = () => {
    return data.filter(point => 
      ['Total des cas', 'Total des morts'].includes(point.metric)
    );
  };

  const getMetricsForGraphs = () => {
    return data.filter(point => 
      !['Total des cas', 'Total des morts'].includes(point.metric)
    );
  };

  // Générer la liste des séries et le mapping couleur
  const getSeriesKeys = (dataArr: DataPoint[]) => {
    return Array.from(new Set(dataArr.map(d => `${d.country}-${d.disease}-${d.metric}`)));
  };
  const allSeriesKeys = Array.from(new Set([
    ...getMetricsForGraphs().map(d => `${d.country}-${d.disease}-${d.metric}`),
    ...getMetricsForSummary().map(d => `${d.country}-${d.disease}-${d.metric}`)
  ]));
  const colorPalette = colors;
  const seriesColorMap: Record<string, string> = {};
  allSeriesKeys.forEach((key, idx) => {
    seriesColorMap[key] = colorPalette[idx % colorPalette.length];
  });

  if ((country as string) === 'Suisse') {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
                <Typography sx={{ ml: 2, alignSelf: 'center' }}>
                  {t('dashboard.loadingData')}
                </Typography>
              </Box>
            ) : error ? (
              <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
            ) : (
              <DataTable 
                data={data}
                columns={['date', 'country', 'disease', 'metric', 'value']}
              />
            )}
          </Container>
        </Box>
      </LocalizationProvider>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        {/* SUPPRESSION DE LA AppBar/Toolbar */}
        {/* <AppBar position="static" sx={{ backgroundColor: theme.palette.primary.main }}>
          <Toolbar>
            <BarChartIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {t('dashboard.title')}
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => setIsFilterOpen(true)}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <FilterAltIcon />
            </IconButton>
          </Toolbar>
        </AppBar> */}

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('dashboard.title')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsFilterOpen(true)}
            sx={{ mb: 3 }}
          >
            {t('dashboard.filters')}
          </Button>
          <FilterPopup
            open={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            onApplyFilters={handleApplyFilters}
          />

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {t('dashboard.errorLoadingData')}
            </Typography>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
              <Typography sx={{ ml: 2, alignSelf: 'center' }}>
                {t('dashboard.loadingData')}
              </Typography>
            </Box>
          ) : (
            data.length > 0 && (
              <Box>
                {getMetricsForSummary().length > 0 && (
                  <MetricsSummary 
                    data={getMetricsForSummary()}
                    startDate={currentFilters?.startDate}
                    endDate={currentFilters?.endDate}
                    colorMap={seriesColorMap}
                  />
                )}
                {/* Affichage conditionnel pour la Suisse */}
                {country !== 'Suisse' && getMetricsForGraphs().length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography 
                      variant="h5" 
                      component="h2" 
                      gutterBottom
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                        mb: 3,
                        borderBottom: `2px solid ${theme.palette.primary.main}`,
                        pb: 1
                      }}
                    >
                      {t('graph.title')}
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={predictions.length > 0 ? 8 : 9}>
                        <Graph 
                          data={getMetricsForGraphs()}
                          title={t('graph.title')}
                          timeGrouping={currentFilters?.timeGrouping || 'day'}
                          colorMap={seriesColorMap}
                        />
                      </Grid>
                      {predictions && predictions.length > 0 ? (
                        <Grid item xs={12} md={4}>
                          <Predictions filters={currentFilters || undefined} />
                        </Grid>
                      ) : null}
                    </Grid>
                  </Box>
                )}

                <Box sx={{ mt: 4 }}>
                  <DataTable 
                    data={data}
                    columns={['date', 'country', 'disease', 'metric', 'value']}
                  />
                </Box>
              </Box>
            )
          )}
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default Dashboard; 