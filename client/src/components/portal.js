import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPen, faPenRuler } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

function Portal() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLinkClick = (path) => {
    navigate(path);
  };

  return (
    <div className="d-flex justify-content-center">
      <Card className="d-flex justify-content-center p-3 m-4" style={{ width: '30rem' }}>
        <FontAwesomeIcon icon={faUserPen} size="6x" />
        <Card.Body className="d-flex justify-content-center align-items-center flex-column">
          <Card.Title>{t('portal.author.title')}</Card.Title>
          <Button variant="primary" onClick={() => handleLinkClick('/portal-author/login')}>
            {t('portal.author.button')}
          </Button>
        </Card.Body>
      </Card>
      
      <Card className="d-flex justify-content-center p-3 m-4" style={{ width: '30rem' }}>
        <FontAwesomeIcon icon={faPenRuler} size="6x" />
        <Card.Body className="d-flex justify-content-center align-items-center flex-column">
          <Card.Title>{t('portal.reviewer.title')}</Card.Title>
          <Button variant="primary" onClick={() => handleLinkClick('/portal-reviewer/login')}>
            {t('portal.reviewer.button')}
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Portal;