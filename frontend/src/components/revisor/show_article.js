import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Accordion } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useContext } from "react";
import AuthContext from "../../context/context";
/*import './estilos/navBar.css'*/

const DisplaySection = ({ section, summarySection, preEvalSection, updateReview }) => {
  const [reviewSection, setReviewSection] = useState("");
  const [editing, setEditing] = useState(true);


  const handleSave = () => {
      updateReview(section, reviewSection);
      setEditing(!editing);
  };

  const handleEdit = () => {
      setEditing(true);
  };

  return (
    <Accordion.Item eventKey={section}>
        <Accordion.Header>{section}</Accordion.Header>
        <Accordion.Body>
            <h5>Resumen</h5>
            <p>{summarySection}</p>
            <h5>PreEvaluación</h5>
            <p>{preEvalSection}</p>
            <h5>Revisión</h5>
            {editing ? (
                <Form.Group>
                    <Form.Control 
                        as="textarea"
                        rows = {3}
                        value={reviewSection}
                        onChange={e => setReviewSection(e.target.value)} 
                    />

                    <Button className='btn btn-secondary mt-3' variant="primary" onClick={handleSave}>
                        Guardar Revisión de Sección
                    </Button>
                </Form.Group>
            ) : (
                <div className='p-2' style={{cursor: "pointer"}} onClick={handleEdit}>
                    <Card.Text style={{color: "red"}}>
                    {reviewSection}
                </Card.Text>
                </div>
                
            )}
        </Accordion.Body>
    </Accordion.Item>
);
}


function ShowArticle() {
    const {sessionToken} = useContext(AuthContext); // Accede a username y sessionToken desde el contexto
    const { username, article_title } = useParams();
    const [article, setArticle] = useState({});
    const [review, setReview] = useState({});

    useEffect(() => {
        async function fetchArticle() {
            const response = await fetch(`/api/v1/evaluate/${username}/${article_title}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`,
                }
            });
            const data = await response.json();

            setArticle(data);
            setReview(data.evaluation);
        }

        fetchArticle();
    }, [username, article_title, sessionToken]);

    const addReview = async () => {
        const response = await fetch(`/api/v1/evaluate/${username}/${article_title}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ review })
        });
        const data = await response.json();

        console.log(data); 
    };

    const updateReview = (section, reviewSection) => {
        setReview(prevReview => ({ ...prevReview, [section]: reviewSection }));
    };

    return (
        <Card style={{ width: '100%' }}>
            <Card.Body>
                <Card.Title>{article.title}</Card.Title>
                <Card.Text>{article.description}</Card.Text>
                <Accordion defaultActiveKey={"Introduction"}>
                {article.summary &&
                    Object.entries(article.summary).map(([section, summarySection]) => (
                        <DisplaySection
                            key={section}
                            section={section}
                            summarySection={summarySection}
                            preEvalSection={article.evaluation[section]}
                            updateReview={updateReview}
                        />
                    ))}
                </Accordion>
                <Button className="btn bg-info mt-3" variant="primary" onClick={addReview}>
                    Guardar Revisión
                </Button>
            </Card.Body>
        </Card>
    );
}

export default ShowArticle;
