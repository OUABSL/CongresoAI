import React, {useEffect, useContext} from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import fileDownload from 'js-file-download';
import { AlertContext } from '../../context/alertProvider';


const SubmitSummary = () => {
    const location = useLocation();
    const { submitSummary, latex_project_url, fileName } = location.state || {}; 
    const { title, author, description, keywords = [],submission_date, submission_id } = submitSummary;
    const { setAlert } = useContext(AlertContext);

    const handleDownload = async () => {
        try {
            const response = await fetch(latex_project_url);
            const data = await response.blob();
            fileDownload(data, fileName);
        } catch (error) {
          console.error("Error during download: ", error);
          setAlert({ show: true, message: "Error en la descarga.", variant: 'danger' });  
        }
    };

    useEffect(() => {
        document.title = `Resumen de enrega`;
      }, []);

    return (
        <Card className="mt-4 p-4 mx-auto" style={{ maxWidth: '600px' }}>
            <Card.Header as="h3">Confirmación de Entrega</Card.Header>
            <Card.Body>
                <Card.Title>Título: {title || 'No disponible'}</Card.Title>
                <Card.Text>
                    Autor: {author || 'No disponible'}
                </Card.Text>
                <Card.Text>
                    ID de entrega: {submission_id || 'No disponible'}
                </Card.Text>
                <Card.Text>
                    Descripción del artículo: {description || 'No disponible'}
                </Card.Text>
                <Card.Text>
                    Palabras clave: {keywords.length > 0 ? keywords.join(', ') : 'No disponible'}
                </Card.Text>
                <Card.Text>
                    Fecha de Entrega: {submission_date || 'No disponible'}
                </Card.Text>
                {latex_project_url  ? 
                    <Button variant="primary" onClick={handleDownload} className="mt-2">
                        Descargar Proyecto LaTeX
                    </Button> : 
                    <Card.Text>No hay URL para el proyecto LaTeX disponible.</Card.Text>
                }
            </Card.Body>
        </Card>
    );
};
    
    export default SubmitSummary;
    