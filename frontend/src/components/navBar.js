import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './estilos/navBar.css'

const MyNavbar = () => {
  const [activeLink, setActiveLink] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [rol, setRol] = useState("");
  const [portalLink, setPortalLink] = useState("");

  


  const navigate = useNavigate();
  const isLoggedIn = () => !!localStorage.getItem('access_token');
  const getLoggedInUser = () => localStorage.getItem('username') || '';
  const getLoggedInUserRol = () => localStorage.getItem('rol') || '';
  
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    setLoggedIn(false);
    setUsername("");
    navigate('/');
  };

  useEffect(() => {
    if (isLoggedIn()) {
      setUsername(getLoggedInUser());
      setRol(getLoggedInUserRol)
      setLoggedIn(true);
    }
  }, []);
  
  useEffect(() => {
    if (rol === "author") {setPortalLink("portal-author")}
    else if (rol === "reviewer") {setPortalLink("portal-reviewer")}
  }, [rol]);

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
            </Nav>

          <Nav>
          {!loggedIn &&(
            <NavDropdown title="Portal" id="collapsible-nav-dropdown">
               <NavDropdown.Item as="div" onClick={() => handleLinkClick('/portal-author')}>
              <Link className='nav-drop-item' to="/portal-author/login">
                  Portal de Autor
                </Link>
              </NavDropdown.Item>
              <NavDropdown.Item as="div"  onClick={() => handleLinkClick('/portal-reviewer')}>
                <Link className='nav-drop-item' to="/portal-reviewer/login">
                  Portal de Revisor
                </Link>
              </NavDropdown.Item>
            </NavDropdown>
            )}
          </Nav>

          {loggedIn && (
          <Nav>
           <NavDropdown title={username} id="nav-dropdown">
              <NavDropdown.Item as="div">
                <NavLink to={`/${portalLink}/profile/${username}`}>
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