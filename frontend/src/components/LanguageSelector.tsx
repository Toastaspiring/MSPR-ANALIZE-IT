import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, isLanguageSelectorVisible, availableLanguages } = useLanguage();
  const { t } = useTranslation();

  if (!isLanguageSelectorVisible) {
    return null;
  }

  const languageLabels: Record<string, string> = {
    fr: t('languages.french'),
    en: t('languages.english'),
    de: t('languages.german'),
    it: t('languages.italian')
  };

  return (
    <div className="language-selector">
      <label htmlFor="language-select" className="language-label">
        {t('navigation.language')}:
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        className="language-select"
      >
        {availableLanguages.map((lang: string) => (
          <option key={lang} value={lang}>
            {languageLabels[lang]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector; 