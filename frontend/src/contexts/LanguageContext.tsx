import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export type Language = 'fr' | 'en' | 'de' | 'it';
export type Country = 'France' | 'Suisse' | 'US';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  country: Country;
  availableLanguages: Language[];
  isLanguageSelectorVisible: boolean;
}

// Configuration des langues par pays
const countryLanguageConfig: Record<Country, { default: Language; available: Language[] }> = {
  'France': { default: 'fr', available: ['fr'] },
  'Suisse': { default: 'fr', available: ['fr', 'de', 'it'] },
  'US': { default: 'en', available: ['en'] }
};

// Création du contexte
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
  userCountry: Country;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, userCountry }) => {
  const config = countryLanguageConfig[userCountry];
  const [language, setLanguageState] = useState<Language>(config.default);

  // Déterminer si le sélecteur de langue doit être visible
  const isLanguageSelectorVisible = config.available.length > 1;

  // Sauvegarder la langue dans localStorage
  const setLanguage = (lang: Language) => {
    if (config.available.includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem('selectedLanguage', lang);
    }
  };

  // Charger la langue sauvegardée au démarrage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') as Language;
    if (savedLanguage && config.available.includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      setLanguageState(config.default);
    }
  }, [config]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    country: userCountry,
    availableLanguages: config.available,
    isLanguageSelectorVisible
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 