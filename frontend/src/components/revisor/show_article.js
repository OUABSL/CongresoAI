import React, { useState, useEffect } from 'react';
import { ButtonGroup, Button, Card, Form, Accordion, Col, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useContext } from "react";
import AuthContext from "../../context/context";
import { Viewer } from '@react-pdf-viewer/core';
// Plugins
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';



/*import './estilos/navBar.css'*/

const DisplaySection = ({ section, summarySection, preEvalSection, updateReview }) => {
  const [reviewSection, setReviewSection] = useState("");
  const [editing, setEditing] = useState(true);
  

  const formatPreEvalSection = (preEvalSection, postEvalSummary) => {
    if(!preEvalSection) {
      return '';
    }
  
    const criteria = ['Motivation:', 'Novelty:', 'Clarity:', 'Grammar and Style:', 'Typos and Errors:'];
  
    let formattedPreEvalSection = preEvalSection;
    
    for (let criterion of criteria) {
      formattedPreEvalSection = formattedPreEvalSection.replaceAll(criterion,
      `<br/><b>${criterion}</b><br/>`);
    }
    
    return formattedPreEvalSection;
  };


  let preEvalSplit = preEvalSection.split("Evaluation Summary:", 2);
  const formattedPreEvalSection = formatPreEvalSection(preEvalSplit[0], preEvalSplit[1]);

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
            <p>{<div dangerouslySetInnerHTML={{ __html: formattedPreEvalSection }} />}</p>
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


const DownloadArticle = ({pdf, zip, title}) =>{
    
    const handleDownloadPdf = async (pdfUrl, filename) => {
        try {
          const response = await fetch(`/api/v1${pdfUrl}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const blob = await response.blob();
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${filename}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
        } catch (error) {
          console.error('Error fetching PDF:', error);
        }
      };
  const handleDownloadZip = async (zipUrl, filename) => {
    try {
      const response = await fetch(`/api/v1${zipUrl}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error fetching Zip:', error);
    }
    };

    return (
        <Row className="justify-content-between">
        <Col xs="auto">
          <Button onClick={() => handleDownloadPdf(pdf, title)}>Descargar PDF</Button>
        </Col>
        <Col xs="auto">
          <Button onClick={() => handleDownloadZip(zip, title)}>Descargar ZIP</Button>
        </Col>
      </Row>
        )
  };



function ShowArticle() {
    const {sessionToken} = useContext(AuthContext); // Accede a username y sessionToken desde el contexto
    const { username, article_title } = useParams();
    const [article, setArticle] = useState({});
    const [review, setReview] = useState({});
    const [selectedPdf, setSelectedPdf] = useState(null);
    const defaultLayoutPluginInstance = defaultLayoutPlugin();



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
    
            // Agrega la línea para llamar a la función handleShowPdf
            await handleShowPdf(`/file/${data.submitted_pdf_id}`);
        }
    
        fetchArticle();
    }, [username, article_title, sessionToken]);

  const handleShowPdf = async (pdfUrl) => {
    try {
      const response = await fetch(`/api/v1${pdfUrl}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const blob = await response.blob();
      const pdf = window.URL.createObjectURL(blob);
      setSelectedPdf(pdf);
    } catch (error) {
      console.error('Error fetching PDF:', error);
    }
  };

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
        <>
        <Row>
            <DownloadArticle
                pdf={`/file/${article.submitted_pdf_id}`}
                title={article.title}
                zip={article.latex_project_id}/>
        </Row>
        <Row className='mb-5 px-3'>
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
        </Row>
        </>

    );
}

export default ShowArticle;
