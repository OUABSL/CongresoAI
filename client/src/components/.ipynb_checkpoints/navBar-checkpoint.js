import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar, Dropdown } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logo from '../ressources/logo.png';
import { faHome, faPaperclip, faCopy, faEnvelopeOpen, faUserAlt, faSignOutAlt, faArrowRight, faAddressCard } from '@fortawesome/free-solid-svg-icons';
import './estilos/navBar.css';

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

  useEffect(() => {
    setActiveLink(window.location.pathname);
  }, []);

  const renderNavigationLink = (path, title, icon) => (
    <Nav.Link as={Link} to={path} onClick={() => setActiveLink(path)} className={(activeLink === path ? 'active ' : '') + 'text-primary'}>
          <FontAwesomeIcon className="text-primary" icon={icon} />
          <span className="navlink-title">{title}</span>
    </Nav.Link>
  );

  return (
    <Navbar collapseOnSelect expand="lg" variant="light" className="navbar">
      <Container>
        <Navbar.Brand as={Link} to={navigationItems.home} onClick={() => setActiveLink(navigationItems.home)}>
        <img src={logo} width="60" height="60" className="d-inline-block align-top" alt="logo"/> 
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-center">
          <Nav className="ml-auto">
            {renderNavigationLink(navigationItems.home, 'Inicio', faHome)}
            {renderNavigationLink(navigationItems.contactus, 'Contactenos', faEnvelopeOpen)}
            {isLoggedIn && renderNavigationLink(`/${portalLink}/articles/${username}`, 'Manuscritos', faCopy)}
            {isLoggedIn && role === 'author' && renderNavigationLink(`/portal-author/submit`, 'Subir Manuscrito', faPaperclip)}
          </Nav>

          <Nav className='ml-auto'>
  {isLoggedIn ? 
    <Dropdown>
      <Dropdown.Toggle as={Nav.Item} id="nav-dropdown" className='dropdown-toggle'>
        <span className="navlink-title text-primary">Bienvenido {username} </span>
        <FontAwesomeIcon className="text-primary" icon={faUserAlt} />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item as={Link} 
                       to={`/${portalLink}/profile/${username}`} 
                       className={`text-primary ${activeLink === `/${portalLink}/profile/${username}` ? 'active' : ''}`} 
                       onClick={() => setActiveLink(`/${portalLink}/profile/${username}`)}>
          <FontAwesomeIcon className="text-primary" icon={faAddressCard}/> Profile
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item className="text-primary" onClick={logout}>
          <FontAwesomeIcon className="text-primary" icon={faSignOutAlt} /> Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown> :
   renderNavigationLink(navigationItems.portal, 'Portal', faArrowRight)
  }
</Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;