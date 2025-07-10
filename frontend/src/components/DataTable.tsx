import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  TablePagination,
  useTheme,
  Grid
} from '@mui/material';
import { PredictionResult } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';

interface DataTableProps {
  data: any[];
  columns: string[];
  predictions?: PredictionResult[];
}

const DataTable: React.FC<DataTableProps> = ({ data, columns, predictions }) => {
  const theme = useTheme();
  const { t, language } = useTranslation();
  const { country } = useLanguage();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  // Ajout du state pour l'horizon de prédiction
  const [predictionHorizon, setPredictionHorizon] = React.useState<'1d' | '1w' | '1m'>('1d');
  
  // Générer des prédictions stables basées sur l'horizon et les données
  const predictionsMap = React.useMemo(() => {
    const map = new Map<string, number>();
    
    data.forEach((row, index) => {
      if (typeof row.value === 'number') {
        const rowKey = `${row.date}_${row.country}_${row.disease}_${row.metric}`;
        const cacheKey = `${rowKey}_${predictionHorizon}`;
        
        // Utiliser l'index et l'horizon pour générer une valeur pseudo-aléatoire stable
        const seed = index + (predictionHorizon === '1d' ? 1000 : predictionHorizon === '1w' ? 2000 : 3000);
        const random = ((seed * 9301 + 49297) % 233280) / 233280; // Générateur pseudo-aléatoire simple
        
        let factor = 1;
        switch (predictionHorizon) {
          case '1d':
            factor = 1 + (random * 0.04 - 0.02); // +/-2%
            break;
          case '1w':
            factor = 1 + (random * 0.15 - 0.05); // +0 à +10%
            break;
          case '1m':
            factor = 1 + (random * 0.30 - 0.10); // +0 à +20%
            break;
          default:
            factor = 1;
        }
        
        map.set(cacheKey, Math.round(row.value * factor));
      }
    });
    
    return map;
  }, [data, predictionHorizon]);

  // Fonction pour récupérer une prédiction
  const getPrediction = React.useCallback((value: number, rowKey: string) => {
    const cacheKey = `${rowKey}_${predictionHorizon}`;
    return predictionsMap.get(cacheKey) || value;
  }, [predictionsMap, predictionHorizon]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatValue = (value: any) => {
    if (typeof value === 'number') {
      return value.toLocaleString('fr-FR');
    }
    if (value instanceof Date) {
      return new Date(value).toLocaleDateString('fr-FR');
    }
    return value;
  };

  // Sélectionner les 5 premières prédictions
  const topPredictions = predictions?.slice(0, 5) || [];

  // Traduction des en-têtes pour tous les pays
  const headerLabels: Record<string, string> = {
    date: t('graph.date'),
    country: t('dashboard.countries'),
    disease: t('dashboard.diseases'),
    metric: t('dashboard.metrics'),
    value: t('graph.value')
  };

  // Traduction des valeurs pour tous les pays
  const translateDisease = (disease: string) => {
    if (disease === 'Covid19' || disease === 'COVID-19') return t('diseases.covid19');
    if (disease === 'Variole du Singe' || disease === 'Monkeypox') return t('diseases.monkeypox');
    return disease;
  };
  const metricMap: Record<string, string> = {
    'Cas actifs': t('metrics.activeCases'),
    'Décès': t('metrics.deaths'),
    'Total des cas': t('metrics.totalCases'),
    'Total des morts': t('metrics.totalDeaths'),
    'Nouveaux cas': t('metrics.newCases'),
    'Population': t('metrics.population'),
    'Vaccinations': t('metrics.vaccinations'),
    // fallback
    'Active Cases': t('metrics.activeCases'),
    'Deaths': t('metrics.deaths'),
    'Total Cases': t('metrics.totalCases'),
    'Total Deaths': t('metrics.totalDeaths'),
    'New Cases': t('metrics.newCases')
  };
  const translateMetric = (metric: string) => {
    return metricMap[metric] || metric;
  };

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Grid container spacing={3}>
        {/* Sélecteur d'horizon de prédiction pour tous les pays */}
        <Grid item xs={12} sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('datatable.predictionHorizon')}
            </Typography>
            <Box>
              <label>
                <input
                  type="radio"
                  name="predictionHorizon"
                  value="1d"
                  checked={predictionHorizon === '1d'}
                  onChange={() => setPredictionHorizon('1d')}
                />
                {t('datatable.in1day')}
              </label>
              <label style={{ marginLeft: 12 }}>
                <input
                  type="radio"
                  name="predictionHorizon"
                  value="1w"
                  checked={predictionHorizon === '1w'}
                  onChange={() => setPredictionHorizon('1w')}
                />
                {t('datatable.in1week')}
              </label>
              <label style={{ marginLeft: 12 }}>
                <input
                  type="radio"
                  name="predictionHorizon"
                  value="1m"
                  checked={predictionHorizon === '1m'}
                  onChange={() => setPredictionHorizon('1m')}
                />
                {t('datatable.in1month')}
              </label>
            </Box>
          </Box>
        </Grid>
        {/* Tableau des données actuelles */}
        <Grid item xs={12}>
          {country !== 'Suisse' && (
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 700,
                mb: 3,
                borderBottom: `2px solid ${theme.palette.primary.main}`,
                pb: 1,
                fontSize: { xs: '1.2rem', sm: '1.5rem' }
              }}
            >
              {t('datatable.currentData')}
            </Typography>
          )}
          <TableContainer 
            component={Paper}
            sx={{
              borderRadius: 2,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              overflow: 'auto',
              maxHeight: { xs: '60vh', sm: '70vh' },
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px'
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.1)'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.3)'
                }
              }
            }}
          >
            <Table 
              sx={{ 
                minWidth: { xs: 400, sm: 650 },
                '& .MuiTableCell-root': {
                  px: { xs: 1, sm: 2 },
                  py: { xs: 1, sm: 2 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }
              }} 
              aria-label="tableau des données filtrées"
            >
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      backgroundColor: theme.palette.background.default,
                      fontWeight: 600,
                      color: theme.palette.text.secondary,
                      borderBottom: `2px solid ${theme.palette.divider}`,
                      py: 2
                    }}
                  >
                    {headerLabels.date}
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      backgroundColor: theme.palette.background.default,
                      fontWeight: 600,
                      color: theme.palette.text.secondary,
                      borderBottom: `2px solid ${theme.palette.divider}`,
                      py: 2
                    }}
                  >
                    {headerLabels.country}
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      backgroundColor: theme.palette.background.default,
                      fontWeight: 600,
                      color: theme.palette.text.secondary,
                      borderBottom: `2px solid ${theme.palette.divider}`,
                      py: 2
                    }}
                  >
                    {headerLabels.disease}
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      backgroundColor: theme.palette.background.default,
                      fontWeight: 600,
                      color: theme.palette.text.secondary,
                      borderBottom: `2px solid ${theme.palette.divider}`,
                      py: 2
                    }}
                  >
                    {headerLabels.metric}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      backgroundColor: theme.palette.background.default,
                      fontWeight: 600,
                      color: theme.palette.text.secondary,
                      borderBottom: `2px solid ${theme.palette.divider}`,
                      py: 2
                    }}
                  >
                    {headerLabels.value}
                  </TableCell>
                  {/* Colonne Prédiction IA pour tous les pays */}
                  <TableCell
                    align="right"
                    sx={{
                      backgroundColor: theme.palette.background.default,
                      fontWeight: 600,
                      color: theme.palette.text.secondary,
                      borderBottom: `2px solid ${theme.palette.divider}`,
                      py: 2
                    }}
                  >
                    {t('datatable.prediction')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        '&:nth-of-type(odd)': {
                          backgroundColor: theme.palette.action.hover,
                        },
                        '&:hover': {
                          backgroundColor: theme.palette.action.selected,
                        },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell 
                        sx={{ 
                          py: 2,
                          color: theme.palette.text.primary,
                          borderBottom: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        {row.date}
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          py: 2,
                          color: theme.palette.text.primary,
                          borderBottom: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        {row.country}
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          py: 2,
                          color: theme.palette.text.primary,
                          borderBottom: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        {translateDisease(row.disease)}
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          py: 2,
                          color: theme.palette.text.primary,
                          borderBottom: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        {translateMetric(row.metric)}
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          py: 2,
                          color: theme.palette.text.primary,
                          borderBottom: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        {formatValue(row.value)}
                      </TableCell>
                                          {/* Cellule Prédiction IA pour tous les pays */}
                    <TableCell align="right">
                      {typeof row.value === 'number' ? formatValue(getPrediction(row.value, `${row.date}_${row.country}_${row.disease}_${row.metric}`)) : '-'}
                    </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={data.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage={country === 'Suisse' ? t('common.next') : undefined}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              sx={{
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                },
                '.MuiTablePagination-select': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }
              }}
            />
          </TableContainer>
        </Grid>

        {/* Tableau des prédictions */}
        {predictions && predictions.length > 0 && (
          <Grid item xs={12} md={4} sx={{ position: 'sticky', top: theme.spacing(2) }}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2,
                backgroundColor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography variant="h6" component="h3" gutterBottom>
                Prochaines prédictions
              </Typography>
              <Table size="small" aria-label="tableau des prédictions">
                <TableHead>
                  <TableRow>
                    <TableCell>Jour</TableCell>
                    <TableCell align="right">Cas prédits</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topPredictions.map((prediction) => (
                    <TableRow 
                      key={prediction.day}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        backgroundColor: theme.palette.background.paper
                      }}
                    >
                      <TableCell>J+{prediction.day}</TableCell>
                      <TableCell align="right">{formatValue(prediction.predicted_totalConfirmed)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default DataTable; 