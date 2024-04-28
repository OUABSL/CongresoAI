import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';

const ResumenEntrega = () => {
    const location = useLocation();
    const { submitSummary, latex_project_url } = location.state; // Obtén la variable link de location.state

    return (
        <Card className="mt-4 p-4 mx-auto">
            <Card.Header as="h5">{submitSummary.title}</Card.Header>
            <Card.Body>
                <Card.Title>Author: {submitSummary.author}</Card.Title>
                <Card.Text>
                    Description: {submitSummary.description}
                </Card.Text>
                <Card.Text>
                    Keywords: {submitSummary.key_words.join(', ')}
                </Card.Text>
                <Card.Text>
                    Submitted at: {submitSummary.submission_date}
                </Card.Text>
                {latex_project_url && 
                    <Button variant="primary" href={latex_project_url} className="mt-2"> {/* Utiliza link como href */}
                        Descargar Proyecto Latex
                    </Button>
                }
            </Card.Body>
        </Card>
    );
};

export default ResumenEntrega;
