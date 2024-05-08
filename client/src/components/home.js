import React, {useEffect} from 'react';
import { Container, Row, Col, Card, ListGroup, Button } from 'react-bootstrap';
import { useContext } from 'react';
import AuthContext from '../context/context';
import './estilos/Home.css'; 

const Home = () => {
  const { username, sessionToken, role } = useContext(AuthContext); 
  const isLoggedIn = Boolean(sessionToken && username && role && sessionToken!==null && username!==null && role !==null);
  
  useEffect(() => {
    document.title = `The CongressAI - Inicio`;
  }, []);

  const handleDownload = async () => {
    try {
        const res = await fetch(`/api/v1/manuales/manual-${role}`, {method: 'GET'});
        if(res.ok) {
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
}
  const loggedOutView = (
    <div className="home">
        <Card className="text-center home__title">
        <Card.Body>
          <Card.Title><h1>The AI Congress</h1></Card.Title>
          <Card.Text>
            Un sistema revolucionario de revisión de artículos científicos con inteligencia artificial generativa. 
          </Card.Text>
          <Button href="/portal-author/register" variant="success">¡Solicita su demo!</Button>
        </Card.Body>
      </Card>
    </div>
  );

  const ManualView = (
    <div className="home">
        <Card className="text-center home__title">
        <Card.Body>
          <Card.Title><h1>The AI Congress</h1></Card.Title>
          <Card.Text>
            Un sistema revolucionario de revisión de artículos científicos con inteligencia artificial generativa. 
          </Card.Text>
          {role === "author" ?
            <Button onClick={handleDownload} variant="success">Descargar el manual de autor</Button>
            :
            <Button onClick={handleDownload} variant="success">Descargar el manual de revisor</Button>
          }
        </Card.Body>
      </Card>
    </div>
  );
  
  return (
    <div className="body">
    {!isLoggedIn ? loggedOutView : ManualView} 
      <Container className="home__content">
         <Row className="home__description mb-4">
          <Col md={12}>
            <h2>¿Cómo puede ayudarte The AI Congress?</h2>
            <Card className="home__benefits">
              <Card.Body>
            <p className=''>
              Nuestro sistema utiliza la inteligencia artificial generativa para facilitar la tarea de revisión de artículos científicos minimizando el esfuerzo y el tiempo necesario para hacerlo:
            </p>
            <ListGroup>
              <ListGroup.Item>Evaluación inicial del artículo por la IA generativa.</ListGroup.Item>
              <ListGroup.Item>Resumen automático del artículo.</ListGroup.Item>
              <ListGroup.Item>Asignación al revisor basada en las palabras claves del artículo</ListGroup.Item>
              <ListGroup.Item>Herramientas eficientes para revisión y feedback</ListGroup.Item>
              <ListGroup.Item>Flexibilidad para nuestros usuarios en todo el proceso.</ListGroup.Item>
            </ListGroup>
            </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="home__description mb-4">
          <Col md={12}>
            <h2>¿Cómo funciona The AI Congress?</h2>
            <Card className='use_case'>
              <Card.Body>
                <ol>
                  <li>Tu envías tu artículo en formato proyecto LaTeX (ZIP).</li>
                  <li>Nuestro sistema extrae el contenido y lo prepara de forma adecuada para los posteiores procesos.</li>
                  <li>Producimos un resumen automático de tu artículo con un modelo de IA generativa.</li>
                  <li>Realizamos una evaluación inicial a tu artículo con un modelo de IA generativa.</li>
                  <li>Asignamos tu artículo a un revisor experto basado en la compatibilidad de sus conocimientos con el artículo y su disponiblidad.</li>
                  <li>El revisor recibe el artículo, el resumen y la evaluación para realizar su revisión.</li>
                  <li>El revisor controla el material propocionado por la IA generativa con la disponibilidad de generar nueva versión en todo momento.</li>
                  <li>El revisor aprueba, rechaza o solicita mejoras antes la publicación de tu artículo.</li>
                  <li>El autor visualiza el estado de la revisión de sus artículos asignados, y su resultado en caso de existir.</li>

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