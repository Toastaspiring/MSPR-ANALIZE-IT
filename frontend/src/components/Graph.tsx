import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box, useTheme, Paper, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DataPoint {
  date: string;
  value: number;
  metric: string;
  country: string;
  disease: string;
}

interface GraphProps {
  data: DataPoint[];
  title: string;
  timeGrouping: 'day' | 'week' | 'month';
  colorMap: Record<string, string>;
}

function getAllLabels(start: string, end: string, mode: 'day' | 'week' | 'month') {
  const labels: string[] = [];
  let current = dayjs(start);
  const last = dayjs(end);
  while (current.isBefore(last) || current.isSame(last, mode === 'month' ? 'month' : 'day')) {
    if (mode === 'day') {
      labels.push(current.format('YYYY-MM-DD'));
      current = current.add(1, 'day');
    } else if (mode === 'week') {
      // ISO week start
      labels.push(current.startOf('week').format('YYYY-MM-DD'));
      current = current.add(1, 'week');
    } else {
      labels.push(current.format('YYYY-MM'));
      current = current.add(1, 'month');
    }
  }
  return labels;
}

const Graph: React.FC<GraphProps> = ({ data, title, timeGrouping, colorMap }) => {
  const theme = useTheme();
  const [selectedTimeGrouping, setSelectedTimeGrouping] = useState<'day' | 'week' | 'month'>(timeGrouping);

  // Trouver la période sélectionnée
  const minDate = useMemo(() => data.length > 0 ? dayjs(data.map(d => d.date).sort()[0]) : null, [data]);
  const maxDate = useMemo(() => data.length > 0 ? dayjs(data.map(d => d.date).sort().slice(-1)[0]) : null, [data]);

  // Générer tous les labels de la période
  const allLabels = useMemo(() => {
    if (!minDate || !maxDate) return [];
    return getAllLabels(minDate.format('YYYY-MM-DD'), maxDate.format('YYYY-MM-DD'), selectedTimeGrouping);
  }, [minDate, maxDate, selectedTimeGrouping]);

  // Grouper les données par série et aligner sur tous les labels
  const groupedData = useMemo(() => {
    const grouped = data.reduce((acc, point) => {
      let key: string;
      let label: string;
      const date = dayjs(point.date);
      if (selectedTimeGrouping === 'week') {
        label = date.startOf('week').format('YYYY-MM-DD');
      } else if (selectedTimeGrouping === 'month') {
        label = date.format('YYYY-MM');
      } else {
        label = date.format('YYYY-MM-DD');
      }
      key = `${point.country}-${point.disease}-${point.metric}`;
      if (!acc[key]) acc[key] = {};
      if (!acc[key][label]) acc[key][label] = { sum: 0, count: 0 };
      acc[key][label].sum += point.value;
      acc[key][label].count += 1;
      return acc;
    }, {} as Record<string, Record<string, { sum: number; count: number }>>);

    return Object.entries(grouped).map(([key, values]) => {
      const [country, disease, metric] = key.split('-');
      // Aligner sur tous les labels
      const data = allLabels.map(label =>
        values[label] ? values[label].sum / values[label].count : null
      );
      return {
        label: `${country} - ${disease} - ${metric}`,
        data,
        colorKey: `${country}-${disease}-${metric}`
      };
    });
  }, [data, selectedTimeGrouping, allLabels]);

  // Fixer la hauteur du graphique pour tous les modes
  const chartHeight = 500;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        display: true,
        labels: {
          boxWidth: 20,
          padding: 10,
          font: {
            size: window.innerWidth < 600 ? 10 : 12
          }
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          size: window.innerWidth < 600 ? 14 : 16
        }
      }
    },
    scales: {
      x: {
        type: 'category' as const,
        title: {
          display: true,
          text: 'Date'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: window.innerWidth < 600 ? 10 : 12
          }
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Valeur'
        },
        ticks: {
          font: {
            size: window.innerWidth < 600 ? 10 : 12
          }
        }
      }
    }
  };

  const chartData = {
    labels: allLabels,
    datasets: groupedData.map((series) => ({
      label: series.label,
      data: series.data,
      borderColor: colorMap[series.colorKey] || '#888',
      backgroundColor: (colorMap[series.colorKey] || '#888') + '80',
      tension: 0.1,
      spanGaps: true
    }))
  };

  const handleTimeGroupingChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeGrouping: 'day' | 'week' | 'month' | null
  ) => {
    if (newTimeGrouping !== null) {
      setSelectedTimeGrouping(newTimeGrouping);
    }
  };

  return (
    <Paper 
      sx={{ 
        p: { xs: 1, sm: 2 }, 
        width: '100%' 
      }} 
      role="region" 
      aria-labelledby="graph-title" 
      aria-label="Graphique d'évolution des métriques sélectionnées"
    >
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' }, 
          mb: 2 
        }}
      >
        <Typography 
          id="graph-title" 
          variant="h6" 
          component="h2"
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem' },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          {title}
        </Typography>
        <ToggleButtonGroup
          value={selectedTimeGrouping}
          exclusive
          onChange={handleTimeGroupingChange}
          aria-label="Sélection du regroupement temporel du graphique"
          size={window.innerWidth < 600 ? "small" : "medium"}
          sx={{
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}
        >
          <ToggleButton value="day">Par jour</ToggleButton>
          <ToggleButton value="week">Par semaine</ToggleButton>
          <ToggleButton value="month">Par mois</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box 
        sx={{ 
          height: { 
            xs: 300, 
            sm: 400, 
            md: chartHeight 
          },
          width: '100%'
        }} 
        aria-label="Zone de rendu du graphique"
      >
        <Line options={chartOptions} data={chartData} />
      </Box>
    </Paper>
  );
};

export default Graph; 