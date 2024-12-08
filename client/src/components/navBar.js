// NavBar.js
import React, { useState, useEffect, useContext } from 'react';
import { Container, Nav, Navbar, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AuthContext from '../context/context';
import LanguageSwitcher from './languageSwitcher'; // Asegúrate de importar correctamente el componente
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPaperclip, faCopy, faEnvelopeOpen, faUserAlt, faSignOutAlt, faArrowRight, faAddressCard } from '@fortawesome/free-solid-svg-icons';
import './estilos/navBar.css';
import esIcon from '../ressources/es.svg';
import enIcon from '../ressources/en.svg';
import logo from '../ressources/logo.png';
import { useTranslation } from 'react-i18next';


const navigationItems = {
  home: '/',
  contactus: '/contactus',
  portal: '/portal'
};

const MyNavbar = () => {
  const [activeLink, setActiveLink] = useState(navigationItems.home);
  const { username, sessionToken, role, logout } = useContext(AuthContext);
  const isLoggedIn = sessionToken && username && role;
  const portalLink = `portal-${role}`;
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const toggleLanguage = () => {
    const newLang = currentLang === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang); // Cambiar el idioma
    localStorage.setItem('idi', newLang); // Persistir en localStorage
  };

  useEffect(() => {
    setActiveLink(window.location.pathname);
  }, []);

  const renderNavigationLink = (path, title, icon) => (
    <Nav.Link as={Link} to={path} onClick={() => setActiveLink(path)} className={(activeLink === path ? 'active ' : '') + 'text-primary'}>
      <FontAwesomeIcon className={activeLink === path ? 'text-primary' : ''} icon={icon} color={activeLink === path ? '' : '#000'} />
      <span className={activeLink === path ? 'navlink-title text-primary' : 'navlink-title'} style={{ color: activeLink === path ? '' : '#000' }}>{t(title)}</span>
    </Nav.Link>
  );

  return (
    <Navbar collapseOnSelect expand="lg" variant="light" className="navbar">
      <Container>
        <Navbar.Brand as={Link} to={navigationItems.home} onClick={() => setActiveLink(navigationItems.home)}>
          <img src={logo} width="60" height="60" className="d-inline-block align-top" alt="logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-center">
          <Nav className="ml-auto">
            {renderNavigationLink(navigationItems.home, 'navbar.home', faHome)}
            {renderNavigationLink(navigationItems.contactus, 'navbar.contact', faEnvelopeOpen)}
            {isLoggedIn && renderNavigationLink(`/${portalLink}/articles/${username}`, 'navbar.articles', faCopy)}
            {isLoggedIn && role === 'author' && renderNavigationLink(`/portal-author/submit`, 'navbar.submit', faPaperclip)}
          </Nav>
          <Nav className="ml-auto">
            {/* <LanguageSwitcher /> */}
            {/* Botones de idioma */}
          <div className="d-flex align-items-center">
            <button onClick={toggleLanguage} className="btn-idi-switcher btn btn-light mx-2">
              <img src={currentLang === 'es' ? enIcon : esIcon} alt="Change Language" width={25} height={25} background="None" />
            </button>
          </div>
            {isLoggedIn ? (
              <Dropdown>
                <Dropdown.Toggle as={Nav.Item} id=".nav-link nav-dropdown" className="dropdown-toggle">
                  <FontAwesomeIcon className={activeLink === `/${portalLink}/profile/${username}` ? 'text-primary' : ''} color={activeLink === `/${portalLink}/profile/${username}` ? '' : '#01004B'} icon={faUserAlt} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>
                  <span className={activeLink === `/${portalLink}/profile/${username}` ? 'text-primary' : ''} style={{ color: activeLink === `/${portalLink}/profile/${username}` ? '' : '#01003D' }}>
                    {t('navbar.welcome')} <span className="fst-italic text-decoration-underline">{username}</span>
                  </span>
                  </Dropdown.Item>
                  <Dropdown.Item
                    as={Link}
                    to={`/${portalLink}/profile/${username}`}
                    className={`text-primary ${activeLink === `/${portalLink}/profile/${username}` ? 'active' : ''}`}
                    onClick={() => setActiveLink(`/${portalLink}/profile/${username}`)}
                  >
                    <FontAwesomeIcon className="text-primary" icon={faAddressCard} /> {t('navbar.profile')}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item className="text-dark" onClick={logout}>
                    <FontAwesomeIcon className="text-dark" icon={faSignOutAlt} /> {t('navbar.logout')}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : renderNavigationLink(navigationItems.portal, 'navbar.portal', faArrowRight)}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
