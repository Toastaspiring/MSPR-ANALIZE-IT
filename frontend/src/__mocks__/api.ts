// Mock des services API pour les tests
export const getFilteredReportCases = jest.fn().mockResolvedValue({
  France: {
    covid: {
      dates: ['2023-01-01', '2023-01-02'],
      'Cas actifs': [1000, 1100],
      'Décès': [10, 12],
      'Nouveaux cas': [50, 60]
    },
    monkeypox: {
      dates: ['2023-01-01', '2023-01-02'],
      'Cas actifs': [5, 6],
      'Décès': [0, 0],
      'Nouveaux cas': [1, 1]
    }
  },
  Suisse: {
    covid: {
      dates: ['2023-01-01', '2023-01-02'],
      'Cas actifs': [800, 900],
      'Décès': [8, 9],
      'Nouveaux cas': [40, 45]
    },
    monkeypox: {
      dates: ['2023-01-01', '2023-01-02'],
      'Cas actifs': [3, 4],
      'Décès': [0, 0],
      'Nouveaux cas': [1, 1]
    }
  }
});

export const getPredictions = jest.fn().mockResolvedValue([
  {
    disease: 'Covid19',
    metric: 'Cas actifs',
    country: 'France',
    predictions: [
      { date: '2023-01-03', value: 1200 },
      { date: '2023-01-04', value: 1300 }
    ]
  }
]);

export const getCountries = jest.fn().mockResolvedValue(['France', 'Suisse', 'US']);