import '@testing-library/jest-dom';
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LanguageProvider } from './contexts/LanguageContext';

// Créer un thème Material-UI pour les tests
const theme = createTheme();

// Wrapper personnalisé pour les tests
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <LanguageProvider userCountry="Suisse">
          {children}
        </LanguageProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

// Fonction de rendu personnalisée
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Ré-exporter tout
export * from '@testing-library/react';
export { customRender as render }; 