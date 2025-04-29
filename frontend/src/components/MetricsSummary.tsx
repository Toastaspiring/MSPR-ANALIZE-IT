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
      <Grid container spacing={2}>
        {Object.values(metricsTotals).map(({ country, disease, metric, total, colorKey }) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={`${country}-${disease}-${metric}`}>
            <Paper
              sx={{
                p: 2,
                borderLeft: `6px solid ${colorMap[colorKey] || '#888'}`,
                borderRadius: 2,
                boxShadow: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                backgroundColor: '#fff',
                minHeight: 120
              }}
              aria-label={`Métrique ${metric} pour ${country} - ${disease}`}
            >
              <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 0.5 }}>
                {country} - {disease}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {metric}
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: colorMap[colorKey] || '#888',
                  fontWeight: 'bold',
                  letterSpacing: 1
                }}
              >
                {new Intl.NumberFormat('fr-FR').format(total)}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MetricsSummary; 