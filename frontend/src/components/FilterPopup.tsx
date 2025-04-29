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
import { getCountries } from '../services/api';
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        const response = await getCountries();
        setCountries(response);
      } catch (error) {
        console.error('Erreur lors du chargement des pays:', error);
      }
    };

    fetchCountries();
  }, []);

  const handleApplyFilters = () => {
    if (selectedDiseases.length === 0) {
      setErrorMsg('Veuillez sélectionner au moins une maladie');
      return;
    }
    if (selectedMetrics.length === 0) {
      setErrorMsg('Veuillez sélectionner au moins une métrique');
      return;
    }
    if (selectedCountries.length === 0) {
      setErrorMsg('Veuillez sélectionner au moins un pays');
      return;
    }
    setErrorMsg(null);
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
      aria-labelledby="filter-dialog-title"
    >
      <DialogTitle 
        id="filter-dialog-title" 
        component="h2" 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterAltIcon color="primary" aria-hidden="true" />
          <Typography variant="h6" component="span">Filtres</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="Fermer la fenêtre des filtres">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ py: 3 }}>
        {errorMsg && (
          <Box role="alert" sx={{ mb: 2, color: theme.palette.error.main, fontWeight: 'bold' }}>{errorMsg}</Box>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <InputLabel id="diseases-label" htmlFor="diseases-select">Maladies</InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="diseases-label"
                  id="diseases-select"
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
                  inputProps={{ 'aria-label': 'Sélection des maladies' }}
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
              <InputLabel id="metrics-label" htmlFor="metrics-select">Métriques</InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="metrics-label"
                  id="metrics-select"
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
                  inputProps={{ 'aria-label': 'Sélection des métriques' }}
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
              <InputLabel id="countries-label" htmlFor="countries-autocomplete">Pays</InputLabel>
              <Autocomplete
                multiple
                id="countries-autocomplete"
                options={countries}
                getOptionLabel={(option) => option.name}
                value={selectedCountries}
                onChange={(_, newValue) => setSelectedCountries(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Sélectionnez un ou plusieurs pays"
                    variant="outlined"
                    inputProps={{
                      ...params.inputProps,
                      'aria-label': 'Sélection des pays',
                    }}
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
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }} id="periode-label">
                Période
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="Date de début"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{ textField: { fullWidth: true, variant: 'outlined', inputProps: { 'aria-label': 'Date de début' } } }}
                  />
                  <DatePicker
                    label="Date de fin"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{ textField: { fullWidth: true, variant: 'outlined', inputProps: { 'aria-label': 'Date de fin' } } }}
                  />
                </Box>
              </LocalizationProvider>
            </Box>

            <Box sx={{ mb: 3 }}>
              <InputLabel id="time-grouping-label" htmlFor="time-grouping-select">Regroupement temporel</InputLabel>
              <FormControl fullWidth>
                <Select
                  labelId="time-grouping-label"
                  id="time-grouping-select"
                  value={timeGrouping}
                  onChange={handleTimeGroupingChange}
                  label="Regroupement temporel"
                  inputProps={{ 'aria-label': 'Regroupement temporel' }}
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
          sx={{ borderRadius: 2, textTransform: 'none' }}
          aria-label="Annuler et fermer la fenêtre des filtres"
        >
          Annuler
        </Button>
        <Button
          onClick={handleApplyFilters}
          variant="contained"
          sx={{ borderRadius: 2, textTransform: 'none' }}
          aria-label="Appliquer les filtres et générer le tableau"
        >
          Générer le tableau
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterPopup;