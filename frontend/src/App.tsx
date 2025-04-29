import React, { useState } from 'react';
import { Container, Button, Box, CircularProgress, Typography, Paper, AppBar, Toolbar, IconButton, useTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import FilterPopup, { FilterData } from './components/FilterPopup';
import Graph from './components/Graph';
import DataTable from './components/DataTable';
import MetricsSummary from './components/MetricsSummary';
import { getFilteredReportCases } from './services/api';
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

function App() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterData | null>(null);
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
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setError('Une erreur est survenue lors de la récupération des données.');
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
                    <Graph 
                      data={getMetricsForGraphs()}
                      title="Évolution des métriques"
                      timeGrouping={currentFilters?.timeGrouping || 'day'}
                      colorMap={seriesColorMap}
                    />
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
