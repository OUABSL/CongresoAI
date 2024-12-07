import React from 'react';
import "./estilos/footer.css";
import { useTranslation } from 'react-i18next';

const LinkSection = () => {
  const { t } = useTranslation();
  return (
    <div className="col-md-3 mb-md-0 mb-3">
      <h5 className="text-uppercase">{t('footer.services')}</h5>
      <ul className="list-unstyled">
        <li><a href="#!">{t('footer.uploadArticle')}</a></li>
        <li><a href="#!">{t('footer.reviewArticles')}</a></li>
        <li><a href="#!">{t('footer.accessProfile')}</a></li>
      </ul>
    </div>
  );
};

const ContactSection = () => {
  const { t } = useTranslation();
  return (
    <div className="col-md-3 mb-md-0 mb-3">
      <h5 className="text-uppercase">{t('footer.contactUs')}</h5>
      <ul className="list-unstyled">
        <li><a href="#!">Link 1</a></li>
        <li><a href="#!">Link 2</a></li>
        <li><a href="#!">Link 3</a></li>
        <li><a href="#!">Link 4</a></li>
      </ul>
    </div>
  );
};

const AppFooter = () => {
  const { t } = useTranslation();
  return (
    <footer className="page-footer font-small pt-2">
      <div className="text-center py-2 text-dark">
        <h5 className="text-uppercase text-dark">{t('footer.alphaVersion')}</h5>
        <p>{t('footer.initialVersion')}</p>
      </div>
      <div className="footer-copyright text-center text-dark my-2">
        © 2024 {t('footer.copyright')}: 
        <a href='https://www.linkedin.com/in/ouael-boussiali/'> Ouael Boussiali</a> | 
        <a href="https://www.cs.us.es/" className="text-secondary">{t('footer.department')}</a> | 
        <a href="https://www.us.es/" className="text-secondary">{t('footer.university')}</a>
      </div>
    </footer>
  );
};

export default AppFooter;
