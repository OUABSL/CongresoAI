import React from 'react';
import { Container, Row, Col, Card, ListGroup, Button } from 'react-bootstrap';
import './estilos/Home.css'; // Importando estilos CSS

const Home = () => {
  return (
    <div className="home">
        <Card className="text-center home__title">
        <Card.Body>
          <Card.Title><h1>The AI Congress</h1></Card.Title>
          <Card.Text>
            Un sistema revolucionario de revisión de artículos científicos con inteligencia artificial. 
          </Card.Text>
          <Button href="/portal-author/register" variant="success">¡Prueba ahora gratis!</Button>
        </Card.Body>
      </Card>

      <Container className="home__content">
        <Row className="home__info mb-4">
          <Col md={12}>
            <h2>¿Para quién es The AI Congress?</h2>
            <Card className="home__benefits">
              <Card.Body>
                <p>The AI Congress es ideal para:</p>
                <ListGroup>
                  <ListGroup.Item>Autores que quieran publicar en revistas de alto impacto.</ListGroup.Item>
                  <ListGroup.Item>Revisores que deseen optimizar su tiempo.</ListGroup.Item>
                  <ListGroup.Item>Editores que necesiten eficiencia en sus procesos de revisión.</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>

         <Row className="home__description mb-4">
          <Col md={12}>
            <h2>¿Cómo puede ayudarte The AI Congress?</h2>
            <Card className="home__benefits">
              <Card.Body>
            <p>
              Nuestro sistema utiliza la inteligencia artificial para ofrecerte las siguientes ventajas:
            </p>
            <ListGroup>
              <ListGroup.Item>Evaluación completa inmediata con IA</ListGroup.Item>
              <ListGroup.Item>Resumen automático del artículo</ListGroup.Item>
              <ListGroup.Item>Asignación a revisores expertos basada en el contenido del artículo</ListGroup.Item>
              <ListGroup.Item>Herramientas eficientes para revisión y feedback</ListGroup.Item>
            </ListGroup>
            </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="home__description mb-4">
          <Col md={12}>
            <h2>¿Cómo funciona nuestra IA?</h2>
            <Card className='use_case'>
              <Card.Body>
                <ol>
                  <li>Tu envías tu artículo en formato LaTeX.</li>
                  <li>Nuestra IA extrae el contenido y realiza una evaluación detallada.</li>
                  <li>Producimos un resumen automático de tu artículo.</li>
                  <li>Asignamos tu artículo a un revisor experto basado en su contenido.</li>
                  <li>El revisor recibe el artículo, el resumen y la evaluación para realizar su revisión.</li>
                  <li>El revisor aprueba o rechaza la publicación de tu artículo.</li>
                </ol>
              </Card.Body>
            </Card>
          </Col>         
        </Row>
                
        <Row className="mb-4">
          <Col md={12} className="text-center">
            <Button variant="info" size="lg">¡Comienza tu prueba gratuita hoy!</Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;