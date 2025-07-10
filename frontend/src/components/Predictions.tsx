import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  useTheme,
  CircularProgress,
  Alert
} from '@mui/material';
import { useTranslation } from '../hooks/useTranslation';

interface Prediction {
  id: string;
  disease: string;
  country: string;
  metric: string;
  predictionDate: string;
  predictedValue: number;
  confidence: 'high' | 'medium' | 'low';
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface PredictionsProps {
  filters?: {
    diseases?: string[];
    countries?: string[];
    metrics?: string[];
  };
}

const Predictions: React.FC<PredictionsProps> = ({ filters }) => {
  const theme = useTheme();
  const { t, language } = useTranslation();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulation de données de prédictions (à remplacer par un appel API réel)
  useEffect(() => {
    const loadPredictions = async () => {
      try {
        setLoading(true);
        // Simulation d'un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Données de prédiction simulées
        const mockPredictions: Prediction[] = [
          {
            id: '1',
            disease: t('diseases.covid19'),
            country: 'France',
            metric: t('metrics.activeCases'),
            predictionDate: '2024-01-15',
            predictedValue: 12500,
            confidence: 'high',
            trend: 'decreasing'
          },
          {
            id: '2',
            disease: t('diseases.covid19'),
            country: 'Suisse',
            metric: t('metrics.newCases'),
            predictionDate: '2024-01-15',
            predictedValue: 450,
            confidence: 'medium',
            trend: 'stable'
          },
          {
            id: '3',
            disease: t('diseases.monkeypox'),
            country: 'US',
            metric: t('metrics.totalCases'),
            predictionDate: '2024-01-15',
            predictedValue: 8900,
            confidence: 'low',
            trend: 'increasing'
          }
        ];

        setPredictions(mockPredictions);
        setError(null);
      } catch (err) {
        setError(t('predictions.error'));
      } finally {
        setLoading(false);
      }
    };

    loadPredictions();
  }, [language]);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return theme.palette.success.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return theme.palette.error.main;
      case 'decreasing':
        return theme.palette.success.main;
      case 'stable':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return '↗️';
      case 'decreasing':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t('predictions.loading')}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (predictions.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {t('predictions.noPredictions')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ mt: 2, mb: 4 }} role="region" aria-labelledby="predictions-title">
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        mb: 3,
        borderBottom: `2px solid ${theme.palette.primary.main}`,
        pb: 1
      }}>
        <Typography 
          id="predictions-title"
          variant="h5"
          component="h2"
          sx={{ 
            color: theme.palette.primary.main,
            fontWeight: 'bold'
          }}
        >
          {t('predictions.title')}
        </Typography>
        <Chip 
          label={t('predictions.available')} 
          color="primary" 
          variant="outlined"
          size="small"
        />
      </Box>

      <Grid container spacing={2}>
        {predictions.map((prediction) => (
          <Grid item xs={12} sm={6} md={4} key={prediction.id}>
            <Card
              sx={{
                height: '100%',
                borderLeft: `4px solid ${getConfidenceColor(prediction.confidence)}`,
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                    {prediction.disease}
                  </Typography>
                  <Chip
                    label={t(`predictions.confidence.${prediction.confidence}`)}
                    size="small"
                    sx={{
                      backgroundColor: getConfidenceColor(prediction.confidence),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {prediction.country} - {prediction.metric}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                    {new Intl.NumberFormat().format(prediction.predictedValue)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span style={{ fontSize: '1.2rem' }}>{getTrendIcon(prediction.trend)}</span>
                    <Chip
                      label={t(`predictions.trend.${prediction.trend}`)}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: getTrendColor(prediction.trend),
                        color: getTrendColor(prediction.trend)
                      }}
                    />
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary">
                  {t('predictions.nextWeek')} - {new Date(prediction.predictionDate).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Predictions; 