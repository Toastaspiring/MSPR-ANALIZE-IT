import { useLanguage } from '../contexts/LanguageContext';

// Import des traductions
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import de from '../locales/de.json';
import it from '../locales/it.json';

const translations = {
  fr,
  en,
  de,
  it
};

export const useTranslation = () => {
  const { language } = useLanguage();
  
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback vers l'anglais si la traduction n'existe pas
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Retourner la clé si aucune traduction n'est trouvée
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t, language };
}; 