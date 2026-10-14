// LanguageProvider.js
import React, { createContext, useState, useEffect } from 'react';
import i18n from '../utils/i18n';
import { I18nextProvider } from 'react-i18next';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Inicializa el estado del idioma desde localStorage o usa el idioma por defecto
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'es');

  useEffect(() => {
    // Sincroniza i18next con el idioma almacenado
    i18n.changeLanguage(language);
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang); // Persiste el idioma seleccionado
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
