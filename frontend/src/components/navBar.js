import React from 'react';
import { Navbar, Container, Nav, NavDropdown, Button } from 'react-bootstrap';
import './estilos/navBar.css'

const MyNavbar = () => {
  const [activeLink, setActiveLink] = React.useState(null);

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  return (
    <Navbar bg="light" expand="lg" fixed="top" className="shadow-sm">
      <Container fluid className="max-w-7xl mx-auto">
        <Navbar.Brand href="/">Mi Aplicación</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              href="/"
              onClick={() => handleLinkClick('/index')}
              className={activeLink === '/index' ? 'active' : ''}
            >
              Inicio
            </Nav.Link>
            <Nav.Link
              href="/about"
              onClick={() => handleLinkClick('/about')}
              className={activeLink === '/about' ? 'active' : ''}
            >
              Sobre Nosotros
            </Nav.Link>
            <Nav.Link
              href="/contactus"
              onClick={() => handleLinkClick('/contactus')}
              className={activeLink === '/contactus' ? 'active' : ''}
            >
              Contáctanos
            </Nav.Link>
            <NavDropdown title="Portal" id="portalDropdown">
              <NavDropdown.Item href="/portal-author">Portal de Autor</NavDropdown.Item>
              <NavDropdown.Item href="/portal-reviewer">Portal de Revisor</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
