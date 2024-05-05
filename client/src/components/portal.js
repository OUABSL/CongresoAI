import React from 'react'
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPen, faPenRuler} from '@fortawesome/free-solid-svg-icons';


function Portal() {
  const navigate = useNavigate();

  const handleLinkClick = (path) => {
    navigate(path);
  }

  return (
    <div className="d-flex justify-content-between">
      <Card className="p-3" style={{ width: '20rem' }}>
        <FontAwesomeIcon icon={faUserPen} size="6x" />
        <Card.Body>
          <Card.Title>Portal de Autor</Card.Title>
          <Button variant="primary" onClick={() => handleLinkClick('/portal-author/login')}>Ir al portal</Button>
        </Card.Body>
      </Card>
      
      <Card className="p-3" style={{ width: '20rem' }}>
        <FontAwesomeIcon icon={faPenRuler} size="6x" />
        <Card.Body>
          <Card.Title>Portal de Revisor</Card.Title>
          <Button variant="primary" onClick={() => handleLinkClick('/portal-reviewer/login')}>Ir al portal</Button>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Portal;