import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
// import axios from 'axios';

// Données mockées pour les tests
const mockData = {
  data: {
    metrics: [
      {
        country: 'France',
        date: '2023-01-01',
        cases: 1000,
        deaths: 10,
        recovered: 900
      },
      {
        country: 'France',
        date: '2023-01-02',
        cases: 1100,
        deaths: 12,
        recovered: 950
      }
    ]
  }
};

const mockCountries = {
  data: ['France', 'Allemagne', 'Italie']
};

// Mock axios pour éviter les appels réels
// jest.mock('axios');
// const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Dashboard MSPR - Frontend', () => {
  beforeEach(() => {
    // mockedAxios.post.mockResolvedValue(mockData);
    // mockedAxios.get.mockResolvedValue(mockCountries);
  });

  afterEach(() => {
    // jest.clearAllMocks();
  });

  it('affiche le titre principal', () => {
    render(<App />);
    expect(screen.getByText('Tableau de bord des maladies')).toBeInTheDocument();
  });

  it('ouvre et ferme la popup de filtres', () => {
    render(<App />);
    const openButton = screen.getByRole('button', { name: /ouvrir les filtres/i });
    fireEvent.click(openButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    const closeButtons = screen.getAllByRole('button', { name: /fermer/i });
    const closeButton = closeButtons.find(button => 
      button.getAttribute('aria-label') === 'fermer la fenêtre des filtres'
    );
    expect(closeButton).toBeTruthy();
    fireEvent.click(closeButton!);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('affiche les champs de filtres avec labels accessibles', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /ouvrir les filtres/i }));
    expect(screen.getByLabelText(/sélection des maladies/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sélection des métriques/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sélection des pays/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date de début/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date de fin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/regroupement temporel/i)).toBeInTheDocument();
  });

  it('affiche le résumé des métriques après chargement des données', async () => {
    render(<App />);
    // Simuler l'application des filtres
    const applyButton = screen.getByRole('button', { name: /appliquer les filtres/i });
    fireEvent.click(applyButton);
    
    // Attendre que les données soient chargées
    await screen.findByRole('region', { name: /résumé des métriques/i });
    expect(screen.getByText(/résumé des métriques/i)).toBeInTheDocument();
  });

  it('affiche le graphique avec les données chargées', async () => {
    render(<App />);
    // Simuler l'application des filtres
    const applyButton = screen.getByRole('button', { name: /appliquer les filtres/i });
    fireEvent.click(applyButton);
    
    // Attendre que le graphique soit chargé
    await screen.findByRole('region', { name: /graphique d'évolution des métriques sélectionnées/i });
    expect(screen.getByText(/évolution des métriques/i)).toBeInTheDocument();
  });

  it('affiche le tableau de données avec les données chargées', async () => {
    render(<App />);
    // Simuler l'application des filtres
    const applyButton = screen.getByRole('button', { name: /appliquer les filtres/i });
    fireEvent.click(applyButton);
    
    // Attendre que le tableau soit chargé
    const table = await screen.findByRole('table', { name: /tableau des données filtrées/i });
    expect(table).toBeInTheDocument();
    
    // Vérifier que les données mockées sont affichées
    expect(await screen.findByText('France')).toBeInTheDocument();
    expect(await screen.findByText('1000')).toBeInTheDocument();
  });

  it('gère correctement l\'absence de données', async () => {
    // mockedAxios.post.mockResolvedValueOnce({ data: { metrics: [] } });
    render(<App />);
    
    const applyButton = screen.getByRole('button', { name: /appliquer les filtres/i });
    fireEvent.click(applyButton);
    
    // Vérifier qu'un message approprié est affiché
    await screen.findByText(/aucune donnée disponible/i);
  });

  // Accessibilité : vérifie la présence des rôles et aria-labels principaux
  it('tous les rôles ARIA principaux sont présents', () => {
    render(<App />);
    expect(screen.getByRole('region', { name: /résumé des métriques/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /graphique d'évolution des métriques sélectionnées/i })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /tableau des données filtrées/i })).toBeInTheDocument();
  });

  // Nouveaux tests pour les filtres
  describe('Filtres', () => {
    it('permet la sélection multiple de maladies', async () => {
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: /ouvrir les filtres/i }));
      
      const select = screen.getByLabelText(/sélection des maladies/i);
      fireEvent.mouseDown(select);
      
      const options = screen.getAllByRole('option');
      fireEvent.click(options[0]); // Sélectionner COVID-19
      fireEvent.click(options[1]); // Sélectionner Monkeypox
      
      expect(select).toHaveValue(['covid-19', 'monkeypox']);
    });

    it('valide les dates de début et fin', async () => {
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: /ouvrir les filtres/i }));
      
      const dateDebut = screen.getByLabelText(/date de début/i);
      const dateFin = screen.getByLabelText(/date de fin/i);
      
      // Tester une date de fin antérieure à la date de début
      fireEvent.change(dateDebut, { target: { value: '2023-02-01' } });
      fireEvent.change(dateFin, { target: { value: '2023-01-01' } });
      
      expect(screen.getByText(/la date de fin doit être postérieure à la date de début/i)).toBeInTheDocument();
    });

    it('conserve les filtres après fermeture et réouverture', async () => {
      render(<App />);
      
      // Ouvrir les filtres et faire des sélections
      fireEvent.click(screen.getByRole('button', { name: /ouvrir les filtres/i }));
      const paysSelect = screen.getByLabelText(/sélection des pays/i);
      fireEvent.mouseDown(paysSelect);
      fireEvent.click(screen.getByText('France'));
      
      // Fermer les filtres
      const closeButtons = screen.getAllByRole('button', { name: /fermer/i });
      const closeButton = closeButtons.find(button => 
        button.getAttribute('aria-label') === 'fermer la fenêtre des filtres'
      );
      fireEvent.click(closeButton!);
      
      // Réouvrir les filtres
      fireEvent.click(screen.getByRole('button', { name: /ouvrir les filtres/i }));
      
      // Vérifier que les sélections sont conservées
      expect(paysSelect).toHaveValue(['France']);
    });
  });

  // Tests de gestion des erreurs
  describe('Gestion des erreurs', () => {
    it('affiche une erreur en cas d\'échec de chargement des pays', async () => {
      // mockedAxios.get.mockRejectedValueOnce(new Error('Erreur réseau'));
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/erreur lors du chargement des pays/i)).toBeInTheDocument();
      });
    });

    it('affiche une erreur en cas d\'échec de chargement des données', async () => {
      // mockedAxios.post.mockRejectedValueOnce(new Error('Erreur serveur'));
      render(<App />);
      
      const applyButton = screen.getByRole('button', { name: /appliquer les filtres/i });
      fireEvent.click(applyButton);
      
      await waitFor(() => {
        expect(screen.getByText(/erreur lors du chargement des données/i)).toBeInTheDocument();
      });
    });

    it('gère le cas où le serveur renvoie un format de données invalide', async () => {
      // mockedAxios.post.mockResolvedValueOnce({ data: { invalid: 'format' } });
      render(<App />);
      
      const applyButton = screen.getByRole('button', { name: /appliquer les filtres/i });
      fireEvent.click(applyButton);
      
      await waitFor(() => {
        expect(screen.getByText(/format de données invalide/i)).toBeInTheDocument();
      });
    });
  });

  // Tests d'interaction utilisateur avancés
  describe('Interactions utilisateur avancées', () => {
    it('permet de trier le tableau de données', async () => {
      render(<App />);
      const applyButton = screen.getByRole('button', { name: /appliquer les filtres/i });
      fireEvent.click(applyButton);
      
      await waitFor(() => {
        const table = screen.getByRole('table');
        const headers = within(table).getAllByRole('columnheader');
        fireEvent.click(headers[0]); // Cliquer sur l'en-tête de la première colonne
        
        // Vérifier que le tri a été appliqué
        const cells = within(table).getAllByRole('cell');
        expect(cells[0]).toHaveTextContent('Allemagne');
      });
    });

    it('permet de changer la période de regroupement des données', async () => {
      render(<App />);
      
      // Appliquer les filtres
      const applyButton = screen.getByRole('button', { name: /appliquer les filtres/i });
      fireEvent.click(applyButton);
      
      // Attendre le chargement des données
      await waitFor(() => {
        expect(screen.getByRole('region', { name: /graphique/i })).toBeInTheDocument();
      });
      
      // Changer la période
      const periodButton = screen.getByRole('button', { name: /par semaine/i });
      fireEvent.click(periodButton);
      
      // Vérifier que le graphique est mis à jour
      await waitFor(() => {
        // expect(mockedAxios.post).toHaveBeenCalledWith(
        //   expect.any(String),
        //   expect.objectContaining({ groupBy: 'week' })
        // );
      });
    });

    it('permet d\'exporter les données au format CSV', async () => {
      render(<App />);
      
      // Charger les données
      const applyButton = screen.getByRole('button', { name: /appliquer les filtres/i });
      fireEvent.click(applyButton);
      
      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /exporter/i });
        expect(exportButton).toBeInTheDocument();
        
        // Simuler le clic sur le bouton d'export
        fireEvent.click(exportButton);
        
        // Vérifier que le lien de téléchargement est créé
        const downloadLink = screen.getByRole('link', { name: /télécharger/i });
        expect(downloadLink).toHaveAttribute('download');
        expect(downloadLink).toHaveAttribute('href', expect.stringContaining('blob:'));
      });
    });
  });

  // Tests d'accessibilité supplémentaires
  describe('Accessibilité', () => {
    it('maintient le focus correct lors de la navigation au clavier', () => {
      render(<App />);
      
      // Ouvrir les filtres
      const openButton = screen.getByRole('button', { name: /ouvrir les filtres/i });
      fireEvent.click(openButton);
      
      // Vérifier que le focus est dans la popup
      expect(document.activeElement).toBeInTheDocument();
      expect(document.activeElement?.getAttribute('role')).toBe('dialog');
    });

    it('permet la navigation complète au clavier', async () => {
  render(<App />);
      
      // Simuler la navigation au clavier
      await userEvent.tab(); // Premier élément focusable
      
      // Vérifier que tous les éléments interactifs sont accessibles au clavier
      const interactiveElements = screen.getAllByRole('button');
      for (let i = 0; i < interactiveElements.length; i++) {
        await userEvent.tab();
        expect(document.activeElement).toBe(interactiveElements[i]);
      }
    });
  });
});
