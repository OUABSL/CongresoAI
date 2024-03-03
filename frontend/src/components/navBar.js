import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link, NavLink } from 'react-router-dom';
import './estilos/navBar.css'

const MyNavbar = () => {
  const [activeLink, setActiveLink] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  // Your actual logic to check user login status and retrieve username
  const isLoggedIn = () => true;
  const getLoggedInUser = () => localStorage.getItem('username') || '';
  const handleLogout = () => {};

  useEffect(() => {
    if (isLoggedIn()) {
      setUsername(getLoggedInUser());
      setLoggedIn(true);
    }
  }, []);

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary navbar">
      <Container>
        <Link className="navbar-brand" to="/" onClick={() => handleLinkClick('/')}>The AI Congress</Link>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Link to="/index" onClick={() => handleLinkClick('/index')} className={activeLink === '/index' ? 'nav-link active' : 'nav-link'} >Inicio</Link>
            <Link to="/about" onClick={() => handleLinkClick('/about')} className={activeLink === '/about' ? 'nav-link active' : 'nav-link'} >Sobre Nosotros</Link>
            <Link to="/contactus" onClick={() => handleLinkClick('/contactus')} className={activeLink === '/contactus' ? 'nav-link active' : 'nav-link'} >Contáctanos</Link>
            <NavDropdown title="Portal" id="collapsible-nav-dropdown">
              <NavDropdown.Item as={Link} className='nav-drop-item' to="/portal-author/login" onClick={() => handleLinkClick('/portal-author')}>Portal de Autor</NavDropdown.Item>
              <NavDropdown.Item as={Link} className ='nav-drop-item' to="/portal-revisor/login" onClick={() => handleLinkClick('/portal-reviewer')}>Portal de Revisor</NavDropdown.Item>
            </NavDropdown>
          </Nav>

          {loggedIn && (
          <Nav>
           <NavDropdown title={username} id="nav-dropdown">
              <NavDropdown.Item>
                <NavLink to={`/portal-author/profile/${username}`}>
                  Profile
                </NavLink>
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;