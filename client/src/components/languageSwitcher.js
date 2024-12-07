import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageContext from '../context/languageProvider';
import enIcon from '../ressources/en.svg';
import esIcon from '../ressources/es.svg';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useContext(LanguageContext);

  const toggleLanguage = () => {
    const newLang = language === 'es' ? 'en' : 'es';
    changeLanguage(newLang);
  };

  return (
    <div className="language-switcher">
      <button onClick={toggleLanguage} className="language-button">
        <img src={language === 'es' ? enIcon : esIcon} alt={language === 'es' ? 'English' : 'Español'} width="40" height="40" />
      </button>
    </div>
  );
};

export default LanguageSwitcher;
