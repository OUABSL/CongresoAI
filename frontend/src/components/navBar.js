import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useContext } from "react";
import AuthContext from "../context/context";
/*import './estilos/navBar.css'*/

const MyNavbar = () => {
  const [activeLink, setActiveLink] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [portalLink, setPortalLink] = useState("");
  const { username, sessionToken, role, logout } = useContext(AuthContext); 





  
  useEffect(() => {
    if (sessionToken){
      setLoggedIn(true);
    }
    else{
      setLoggedIn(false)
    }
    if (role === "author") {setPortalLink("portal-author")}
    else if (role === "reviewer") {setPortalLink("portal-reviewer")}
  }, [role, sessionToken]);

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  return (
    <Navbar collapseOnSelect expand="lg" className="navbar navbar-dark bg-primary">
      <Container>
        <Link className="navbar-brand" to="/" onClick={() => handleLinkClick('/')}>The AI Congress</Link>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
          <Nav.Item className={activeLink === '/index' ? 'nav-item active' : 'nav-item'}>
              <Link className="nav-link" to="/index" onClick={() => handleLinkClick('/index')}>Inicio</Link>
            </Nav.Item>
            <Nav.Item className={activeLink === '/about' ? 'nav-item active' : 'nav-item'}>
              <Link className="nav-link" to="/about" onClick={() => handleLinkClick('/about')}>Sobre Nosotros</Link>
            </Nav.Item>
            <Nav.Item className={activeLink === '/contactus' ? 'nav-item active' : 'nav-item'}>
              <Link className="nav-link" to="/contactus" onClick={() => handleLinkClick('/contactus')}>Contáctanos</Link>
            </Nav.Item>
            {
              loggedIn && role === "author" &&
              <Nav.Item className={activeLink === `/${portalLink}/submit` ? 'nav-item active' : 'nav-item'}>
                <Link className="nav-link" to={`/${portalLink}/submit`} onClick={() => handleLinkClick(`/${portalLink}/submit`)}>Subir Artículo</Link>
              </Nav.Item>
            }
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
              <NavDropdown.Item onClick={logout}>
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