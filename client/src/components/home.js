import React, { useEffect, useContext } from 'react';
import { Container, Row, Col, Card, ListGroup, Button } from 'react-bootstrap';
import AuthContext from '../context/context';
import './estilos/Home.css';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { username, sessionToken, role } = useContext(AuthContext);
  const { t } = useTranslation();
  
  // Determina si el usuario está autenticado
  const isLoggedIn = Boolean(sessionToken && username && role);

  // Cambia el título de la página según el idioma
  useEffect(() => {
    document.title = `${t('home.title')} - ${t('home.pageTitleSuffix')}`;
  }, [t]);

  // Descarga el manual según el rol del usuario
  const handleDownload = async () => {
    try {
      const res = await fetch(`/api/v1/manuales/manual-${role}`, { method: 'GET' });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `manual-${role}-theaicongress.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Vista para usuarios no autenticados
  const loggedOutView = (
    <div className="home">
      <Card className="text-center home__title">
        <Card.Body>
          <Card.Title><h1>{t('home.title')}</h1></Card.Title>
          <Card.Text>{t('home.description')}</Card.Text>
          <Button href="/portal-author/register" variant="success">{t('home.requestDemo')}</Button>
        </Card.Body>
      </Card>
    </div>
  );

  // Vista para usuarios autenticados con la opción de descargar manual
  const ManualView = (
    <div className="home">
      <Card className="text-center home__title">
        <Card.Body>
          <Card.Title><h1>{t('home.title')}</h1></Card.Title>
          <Card.Text>{t('home.description')}</Card.Text>
          <Button onClick={handleDownload} variant="success">
            {role === 'author' ? t('home.downloadAuthorManual') : t('home.downloadReviewerManual')}
          </Button>
        </Card.Body>
      </Card>
    </div>
  );

  // Contenido principal de la página
  return (
    <div className="body">
      {!isLoggedIn ? loggedOutView : ManualView}
      <Container className="home__content">
        <Row className="home__description mb-4">
          <Col md={12}>
            <h2>{t('home.benefitsTitle')}</h2>
            <Card className="home__benefits">
              <Card.Body>
                <p>{t('home.benefitsDescription')}</p>
                <ListGroup>
                  {[1, 2, 3, 4, 5].map((index) => (
                    <ListGroup.Item key={index}>{t(`home.benefit${index}`)}</ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="home__description mb-4">
          <Col md={12}>
            <h2>{t('home.howItWorksTitle')}</h2>
            <Card className="use_case">
              <Card.Body>
                <ol>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                    <li key={index}>{t(`home.howItWorksStep${index}`)}</li>
                  ))}
                </ol>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
