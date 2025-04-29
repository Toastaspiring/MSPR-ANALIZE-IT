import React, { useState } from 'react';
import { Container, Button, Box, CircularProgress, Typography, Paper, AppBar, Toolbar, IconButton, useTheme, Grid, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import FilterPopup, { FilterData } from './components/FilterPopup';
import Graph from './components/Graph';
import DataTable from './components/DataTable';
import MetricsSummary from './components/MetricsSummary';
import { getFilteredReportCases, getPredictions, PredictionResult } from './services/api';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import BarChartIcon from '@mui/icons-material/BarChart';

interface DataPoint {
  date: string;
  value: number;
  metric: string;
  country: string;
  disease: string;
}

interface DataTableProps {
  data: DataPoint[];
  columns: string[];
}

interface GraphProps {
  data: DataPoint[];
  title: string;
}

interface AppState {
  isFilterOpen: boolean;
  loading: boolean;
  data: DataPoint[];
  error: string | null;
  currentFilters: FilterData | null;
  predictions: PredictionResult[];
}

function App() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterData | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const theme = useTheme();

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

  const shouldShowGraph = (metric: string) => {
    return !['Total des cas', 'Total des morts'].includes(metric);
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
  const colorPalette = [
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
  const seriesColorMap: Record<string, string> = {};
  allSeriesKeys.forEach((key, idx) => {
    seriesColorMap[key] = colorPalette[idx % colorPalette.length];
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <AppBar position="static" sx={{ backgroundColor: theme.palette.primary.main }}>
          <Toolbar>
            <BarChartIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Tableau de Bord des Maladies
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
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Tableau de bord des maladies
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsFilterOpen(true)}
            sx={{ mb: 3 }}
          >
            Ouvrir les filtres
          </Button>

          <FilterPopup
            open={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            onApplyFilters={handleApplyFilters}
          />

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
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

                {getMetricsForGraphs().length > 0 && (
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
                      Graphique
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={predictions.length > 0 ? 8 : 9}>
                        <Graph 
                          data={getMetricsForGraphs()}
                          title="Évolution des métriques"
                          timeGrouping={currentFilters?.timeGrouping || 'day'}
                          colorMap={seriesColorMap}
                        />
                      </Grid>
                      {predictions && predictions.length > 0 ? (
                        <Grid item xs={12} md={4}>
                          <Paper 
                            elevation={3} 
                            sx={{ 
                              p: 3,
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 2,
                              height: '100%',
                              minHeight: '400px',
                              display: 'flex',
                              flexDirection: 'column',
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            <Typography 
                              variant="h6" 
                              component="h3" 
                              gutterBottom
                              sx={{
                                color: theme.palette.text.primary,
                                fontWeight: 500,
                                mb: 3,
                                pb: 2,
                                borderBottom: `1px solid ${theme.palette.divider}`
                              }}
                            >
                              Prévisions des cas
                            </Typography>
                            <Box sx={{ flex: 1, overflow: 'auto' }}>
                              <Table size="medium">
                                <TableHead>
                                  <TableRow>
                                    <TableCell 
                                      sx={{ 
                                        fontWeight: 'bold',
                                        backgroundColor: theme.palette.background.default,
                                        color: theme.palette.text.secondary
                                      }}
                                    >
                                      Échéance
                                    </TableCell>
                                    <TableCell 
                                      align="right"
                                      sx={{ 
                                        fontWeight: 'bold',
                                        backgroundColor: theme.palette.background.default,
                                        color: theme.palette.text.secondary
                                      }}
                                    >
                                      Prévision
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {predictions.map((prediction) => (
                                    <TableRow 
                                      key={prediction.day}
                                      sx={{
                                        '&:nth-of-type(odd)': {
                                          backgroundColor: theme.palette.action.hover
                                        },
                                        '&:last-child td, &:last-child th': { 
                                          border: 0 
                                        },
                                        transition: 'background-color 0.2s',
                                        '&:hover': {
                                          backgroundColor: theme.palette.action.selected
                                        }
                                      }}
                                    >
                                      <TableCell 
                                        sx={{ 
                                          py: 2,
                                          color: theme.palette.text.primary
                                        }}
                                      >
                                        Dans {prediction.day} jour{prediction.day > 1 ? 's' : ''}
                                      </TableCell>
                                      <TableCell 
                                        align="right"
                                        sx={{ 
                                          py: 2,
                                          color: theme.palette.primary.main,
                                          fontWeight: 500
                                        }}
                                      >
                                        {prediction.predicted_totalConfirmed.toLocaleString('fr-FR')}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                mt: 3,
                                pt: 2,
                                borderTop: `1px solid ${theme.palette.divider}`,
                                color: theme.palette.text.secondary,
                                textAlign: 'center'
                              }}
                            >
                              Prévisions basées sur les données historiques
                            </Typography>
                          </Paper>
                        </Grid>
                      ) : currentFilters && (
                        <Grid item xs={12} md={3}>
                          <Paper 
                            elevation={3} 
                            sx={{ 
                              p: 3,
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 2,
                              height: 'fit-content',
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            <Typography 
                              variant="h6" 
                              component="h3" 
                              gutterBottom
                              sx={{
                                color: theme.palette.text.primary,
                                fontWeight: 500,
                                mb: 2,
                                pb: 2,
                                borderBottom: `1px solid ${theme.palette.divider}`
                              }}
                            >
                              Prédictions non disponibles
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: theme.palette.text.secondary,
                                mb: 2
                              }}
                            >
                              Pour afficher les prédictions, veuillez :
                            </Typography>
                            <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                              <Typography component="li" variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                                Sélectionner un seul pays
                              </Typography>
                              <Typography component="li" variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                                Sélectionner une seule maladie
                              </Typography>
                              <Typography component="li" variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Inclure la métrique "Cas actifs"
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      )}
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
}

export default App;
