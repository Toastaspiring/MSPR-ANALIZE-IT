import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  useTheme
} from '@mui/material';

interface MetricsSummaryProps {
  data: {
    date: string;
    value: number;
    metric: string;
    country: string;
    disease: string;
  }[];
  startDate?: string;
  endDate?: string;
  colorMap: Record<string, string>;
}

const MetricsSummary: React.FC<MetricsSummaryProps> = ({ data, startDate, endDate, colorMap }) => {
  const theme = useTheme();

  // Calculer les totaux par pays, maladie et métrique
  const metricsTotals = data.reduce((acc, curr) => {
    const key = `${curr.country}-${curr.disease}-${curr.metric}`;
    if (!acc[key]) {
      acc[key] = {
        country: curr.country,
        disease: curr.disease,
        metric: curr.metric,
        total: 0,
        colorKey: key
      };
    }
    acc[key].total += curr.value;
    return acc;
  }, {} as Record<string, { 
    country: string; 
    disease: string; 
    metric: string;
    total: number; 
    colorKey: string 
  }>);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  // Grouper les métriques par pays et maladie, inclure toutes les métriques sélectionnées
  const groupedMetrics = Object.values(metricsTotals).reduce((acc, curr) => {
    const key = `${curr.country}-${curr.disease}`;
    if (!acc[key]) {
      acc[key] = {
        country: curr.country,
        disease: curr.disease,
        metrics: []
      };
    }
    acc[key].metrics.push(curr);
    return acc;
  }, {} as Record<string, { 
    country: string; 
    disease: string; 
    metrics: typeof metricsTotals[keyof typeof metricsTotals][]
  }>);

  return (
    <Box sx={{ mt: 2, mb: 4 }} role="region" aria-labelledby="metrics-summary-title">
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        mb: 2,
        borderBottom: `2px solid ${theme.palette.primary.main}`,
        pb: 1
      }}>
        <Typography 
          id="metrics-summary-title"
          variant="h5"
          component="h2"
          sx={{ 
            color: theme.palette.primary.main,
            fontWeight: 'bold'
          }}
        >
          Résumé des métriques
        </Typography>
        {startDate && endDate ? (
          <Typography component="span" variant="subtitle1" color="text.secondary">
            du {formatDate(startDate)} au {formatDate(endDate)}
          </Typography>
        ) : (
          <Typography component="span" variant="subtitle1" color="text.secondary">
            (total)
          </Typography>
        )}
      </Box>
      <Grid container spacing={1}>
        {Object.values(groupedMetrics).map(({ country, disease, metrics }) => (
          <Grid item xs={12} key={`${country}-${disease}`}>
            <Paper sx={{ p: 1 }}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" component="h3">
                  {country} - {disease}
                </Typography>
              </Box>
              <Grid container spacing={1}>
                {metrics.map(({ metric, total, colorKey, country, disease }) => (
                  <Grid item xs={12} sm={6} md={4} key={metric}>
                    <Box 
                      sx={{ 
                        p: 1,
                        borderLeft: `4px solid ${colorMap[`${country}-${disease}-${metric}`] || '#888'}`,
                        backgroundColor: `${(colorMap[`${country}-${disease}-${metric}`] || '#888')}10`
                      }}
                      aria-label={`Métrique ${metric} pour ${country} - ${disease}`}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {metric}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: colorMap[`${country}-${disease}-${metric}`] || '#888',
                          fontWeight: 'bold'
                        }}
                      >
                        {new Intl.NumberFormat('fr-FR').format(total)}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MetricsSummary; 