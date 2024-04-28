import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/context';
import logo from '../ressources/logo.png';
import './estilos/navBar.css';
import { useNavigate } from 'react-router-dom';


const navigationItems = {
  home: '/',
  contactus: '/contactus',
  portal: '/portal'
};

const MyNavbar = () => {
  const [activeLink, setActiveLink] = useState(navigationItems.home);
  const { username, sessionToken, role, logout } = useContext(AuthContext); 
  const isLoggedIn = Boolean(sessionToken && username && role);
  const portalLink = `portal-${role}`;
  const navigate = useNavigate();


  useEffect(() => {
    setActiveLink(window.location.pathname);
  }, []);

  const renderNavigationLink = (path, title, exact = false) => (
    <Nav.Item 
      className={activeLink === path ? 'nav-item active' : 'nav-item'} 
      onClick={() => {
        setActiveLink(path);
        navigate(path);
      }}>

        <Link className="nav-link">
          {title}
        </Link>
    </Nav.Item>
  );

  return (
    <Navbar collapseOnSelect expand="lg" className="navbar navbar-dark bg-primary">
      <Container>
        <Link className="navbar-brand d-flex align-items-center" to={navigationItems.home} onClick={() => setActiveLink(navigationItems.home)}>
          <img src={logo} width="60" height="60" className="d-inline-block align-top" alt="logo"/> 
          <span className="mx-2">The AI Congress</span>
        </Link>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {renderNavigationLink(navigationItems.home, 'Inicio')}
            {isLoggedIn && role === 'author' && renderNavigationLink(`/${portalLink}/articles/${username}`, 'Artículos Presentados')}
            {isLoggedIn && role === 'author' && renderNavigationLink(`/${portalLink}/submit`, 'Subir Artículo')}
            {isLoggedIn && role === 'reviewer' && renderNavigationLink(`/${portalLink}/articles/${username}`, 'Artículos Asignados')}
            {renderNavigationLink(navigationItems.contactus, 'Contáctanos')}
          </Nav>

          {!isLoggedIn && renderNavigationLink(navigationItems.portal, 'Portal', true)}

          {isLoggedIn && (
            <Nav>
              <NavDropdown title={username} id="nav-dropdown">
                <NavDropdown.Item as="div">
                  <NavLink to={`/${portalLink}/profile/${username}`}>Profile</NavLink>
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;