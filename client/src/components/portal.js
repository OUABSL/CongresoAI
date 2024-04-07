import React from 'react'
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Portal() {
  const navigate = useNavigate();

  const handleLinkClick = (path) => {
    navigate(path);
  }

  return (
    <div className="d-flex justify-content-around">
      <Card style={{ width: '18rem' }}>
        <FontAwesomeIcon icon="user" size="6x" />
        <Card.Body>
          <Card.Title>Portal de Autor</Card.Title>
          <Card.Text>
            Descripción del portal de Autor
          </Card.Text>
          <Button variant="primary" onClick={() => handleLinkClick('/portal-author/login')}>Ir al portal</Button>
        </Card.Body>
      </Card>
      
      <Card style={{ width: '18rem' }}>
        <FontAwesomeIcon icon="user-edit" size="6x" />
        <Card.Body>
          <Card.Title>Portal de Revisor</Card.Title>
          <Card.Text>
            Descripción del portal de Revisor
          </Card.Text>
          <Button variant="primary" onClick={() => handleLinkClick('/portal-reviewer/login')}>Ir al portal</Button>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Portal;