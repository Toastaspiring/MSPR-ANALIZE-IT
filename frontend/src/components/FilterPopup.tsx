import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Box,
  Autocomplete,
  Typography,
  Divider,
  useTheme,
  IconButton,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import axios from 'axios';
import dayjs from 'dayjs';

interface FilterPopupProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

interface Country {
  name: string;
  continent: string;
}

export interface FilterData {
  diseases: string[];
  metrics: string[];
  countries: string[];
  startDate: string;
  endDate: string;
  timeGrouping: 'day' | 'week' | 'month';
}

const FilterPopup: React.FC<FilterPopupProps> = ({ open, onClose, onApplyFilters }) => {
  const theme = useTheme();
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [timeGrouping, setTimeGrouping] = useState<'day' | 'week' | 'month'>('day');

  const diseases = ['Covid19', 'Variole du Singe'];
  const metrics = [
    'Cas actifs',
    'Décès',
    'Total des cas',
    'Total des morts',
    'Nouveaux cas',
    'Population',
    'Vaccinations'
  ];

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/countries');
        setCountries(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des pays:', error);
      }
    };

    fetchCountries();
  }, []);

  const handleApplyFilters = () => {
    if (selectedDiseases.length === 0) {
      alert('Veuillez sélectionner au moins une maladie');
      return;
    }
    if (selectedMetrics.length === 0) {
      alert('Veuillez sélectionner au moins une métrique');
      return;
    }
    if (selectedCountries.length === 0) {
      alert('Veuillez sélectionner au moins un pays');
      return;
    }

    onApplyFilters({
      diseases: selectedDiseases,
      metrics: selectedMetrics,
      countries: selectedCountries.map(country => country.name),
      startDate: startDate?.format('YYYY-MM-DD'),
      endDate: endDate?.format('YYYY-MM-DD'),
      timeGrouping
    });
    onClose();
  };

  const handleDiseaseChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedDiseases(event.target.value as string[]);
  };

  const handleMetricChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedMetrics(event.target.value as string[]);
  };

  const handleCountryChange = (event: SelectChangeEvent<string[]>) => {
    const selectedCountryNames = event.target.value as string[];
    const selectedCountryObjects = countries.filter(country =>
      selectedCountryNames.includes(country.name)
    );
    setSelectedCountries(selectedCountryObjects);
  };

  const handleTimeGroupingChange = (event: SelectChangeEvent<'day' | 'week' | 'month'>) => {
    setTimeGrouping(event.target.value as 'day' | 'week' | 'month');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterAltIcon color="primary" />
          <Typography variant="h6">Filtres</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ py: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Maladies
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Maladies</InputLabel>
                <Select
                  multiple
                  value={selectedDiseases}
                  onChange={handleDiseaseChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {diseases.map((disease) => (
                    <MenuItem key={disease} value={disease}>
                      {disease}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Métriques
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Métriques</InputLabel>
                <Select
                  multiple
                  value={selectedMetrics}
                  onChange={handleMetricChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {metrics.map((metric) => (
                    <MenuItem key={metric} value={metric}>
                      {metric}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Pays
              </Typography>
              <Autocomplete
                multiple
                options={countries}
                getOptionLabel={(option) => option.name}
                value={selectedCountries}
                onChange={(_, newValue) => setSelectedCountries(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Sélectionnez un ou plusieurs pays"
                    variant="outlined"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={option.name}
                        {...tagProps}
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          color: 'white',
                          '& .MuiChip-deleteIcon': {
                            color: 'white'
                          }
                        }}
                      />
                    );
                  })
                }
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Période
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="Date de début"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined'
                      }
                    }}
                  />
                  <DatePicker
                    label="Date de fin"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined'
                      }
                    }}
                  />
                </Box>
              </LocalizationProvider>
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Regroupement temporel</InputLabel>
                <Select
                  value={timeGrouping}
                  onChange={handleTimeGroupingChange}
                  label="Regroupement temporel"
                >
                  <MenuItem value="day">Par jour</MenuItem>
                  <MenuItem value="week">Par semaine</MenuItem>
                  <MenuItem value="month">Par mois</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none'
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleApplyFilters}
          variant="contained"
          sx={{
            borderRadius: 2,
            textTransform: 'none'
          }}
        >
          Générer le tableau
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterPopup;