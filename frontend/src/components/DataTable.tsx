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

interface DataTableProps {
  data: any[];
  columns: string[];
  predictions?: PredictionResult[];
}

const DataTable: React.FC<DataTableProps> = ({ data, columns, predictions }) => {
  const theme = useTheme();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

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

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Grid container spacing={3}>
        {/* Tableau des données actuelles */}
        <Grid item xs={12}>
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
            Données actuelles
          </Typography>
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
                    Date
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
                    Pays
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
                    Maladie
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
                    Métrique
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
                    Valeur
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
                        {row.disease}
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          py: 2,
                          color: theme.palette.text.primary,
                          borderBottom: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        {row.metric}
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          py: 2,
                          color: theme.palette.primary.main,
                          fontWeight: 500,
                          borderBottom: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        {formatValue(row.value)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={data.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page :"
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