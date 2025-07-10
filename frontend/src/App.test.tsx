import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from './test-utils';
import Dashboard from './pages/Dashboard';

// Mock des services API
jest.mock('./services/api', () => ({
  getFilteredReportCases: jest.fn().mockResolvedValue({
    France: {
      covid: {
        dates: ['2023-01-01', '2023-01-02'],
        'Cas actifs': [1000, 1100],
        'Décès': [10, 12],
        'Nouveaux cas': [50, 60]
      }
    }
  }),
  getPredictions: jest.fn().mockResolvedValue([
    {
      disease: 'Covid19',
      metric: 'Cas actifs',
      country: 'France',
      predictions: [
        { date: '2023-01-03', value: 1200 },
        { date: '2023-01-04', value: 1300 }
      ]
    }
  ]),
  getCountries: jest.fn().mockResolvedValue(['France', 'Suisse', 'US'])
}));

describe('Dashboard MSPR - Frontend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le composant Dashboard sans erreur', async () => {
    render(<Dashboard />);
    expect(await screen.findByText(/horizon de prédiction/i)).toBeInTheDocument();
  });

  it('affiche les éléments de base du tableau', async () => {
    render(<Dashboard />);
    expect(await screen.findByText(/date/i)).toBeInTheDocument();
    expect(await screen.findByText(/pays/i)).toBeInTheDocument();
    expect(await screen.findByText(/maladies/i)).toBeInTheDocument();
    expect(await screen.findByText(/métriques/i)).toBeInTheDocument();
    expect(await screen.findByText(/valeur/i)).toBeInTheDocument();
  });

  it('affiche les prédictions IA', async () => {
    render(<Dashboard />);
    expect(await screen.findByText(/prédiction ia/i)).toBeInTheDocument();
  });

  it('affiche les options d\'horizon de prédiction', async () => {
    render(<Dashboard />);
    expect(await screen.findByText(/dans 1 jour/i)).toBeInTheDocument();
    expect(await screen.findByText(/dans 1 semaine/i)).toBeInTheDocument();
    expect(await screen.findByText(/dans 1 mois/i)).toBeInTheDocument();
  });

  it('affiche le tableau avec les données', async () => {
    render(<Dashboard />);
    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();
    expect(table).toHaveAttribute('aria-label', expect.stringMatching(/données actuelles/i));
  });

  it('permet de changer l\'horizon de prédiction', async () => {
    render(<Dashboard />);
    const radioButton = await screen.findByDisplayValue('1w');
    fireEvent.click(radioButton);
    expect(radioButton).toBeChecked();
  });

  it('affiche les données dans le tableau', async () => {
    render(<Dashboard />);
    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();
  });
});
