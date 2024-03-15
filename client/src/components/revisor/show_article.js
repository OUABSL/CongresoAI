import React, { useState, useEffect } from 'react';
import {Button, Card, Form, Accordion, Alert, Col, Row, DropdownButton, Dropdown } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useContext } from "react";
import AuthContext from "../../context/context";
import { Viewer } from '@react-pdf-viewer/core';
import RegenerationModal from './regeneratePreEvaluation'
// Plugins

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';



const DisplaySection = ({ section, summarySection, preEvalSection, updateReview }) => {
  const [reviewSection, setReviewSection] = useState("");
  const [editing, setEditing] = useState(true);
  

  const formatPreEvalSection = (preEvalSection) => {
    if(!preEvalSection) {
      return '';
    }
  
    const criteria = ['Motivation:', 'Novelty:', 'Clarity:', 'Grammar and Style:', 'Typos and Errors:'];
  
    let formattedPreEvalSection = preEvalSection;
    formattedPreEvalSection = preEvalSection.replace(/\d+\./g, ''); // Elimina todas las apariciones de "(dígito.)"

    
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
            <p dangerouslySetInnerHTML={{ __html: formattedPreEvalSection }} />
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

        <>
    <div style={{display: 'flex', justifyContent: 'flex-end'}}>
      <DropdownButton id="dropdown-button" title="Descargar">
        <Dropdown.Item onClick={() => handleDownloadPdf(pdf, title)}>Descargar PDF</Dropdown.Item>
        <Dropdown.Item onClick={() => handleDownloadZip(zip, title)}>Descargar ZIP</Dropdown.Item>
      </DropdownButton>
    </div>
      </>
        )
  };

function ShowArticle() {
    const {sessionToken, logout} = useContext(AuthContext); // Accede a username y sessionToken desde el contexto
    const { username, article_title } = useParams();
    const [article, setArticle] = useState({});
    const [review, setReview] = useState({});
    const [selectedPdf, setSelectedPdf] = useState(null);
    const sectionOrder = ["Abstract", "Introduction", "Related Word", "Conclusions and future works"];
    const [alert, setAlert] = useState({visible: false, variant: '', message: ''});

    const navigate = useNavigate();

    const goBack = () => {
      navigate(-1);
  }



    useEffect(() => {
        async function fetchArticle() {
            const response = await fetch(`/api/v1/evaluate/${username}/${encodeURIComponent(article_title)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`,
                }
            });

            
            if(response.status === 401) {
              logout();
              return;
            }

            const data = await response.json();
    
            setArticle(data);
            setReview(data.evaluation);
    
            // Agrega la línea para llamar a la función handleShowPdf
            await handleShowPdf(`/file/${data.submitted_pdf_id}`);
        }
    
        fetchArticle();
    }, [username, article_title, sessionToken, logout]);


    const sortSections = article.summary ? Object.entries(article.summary).sort(([firstSection], [secondSection]) => {
      const firstSectionIndex = sectionOrder.indexOf(firstSection);
      const secondSectionIndex = sectionOrder.indexOf(secondSection);
        
      // If the section is not in the sectionOrder array, find it after the specified sections
      if (secondSectionIndex === -1) return -1;
      if (firstSectionIndex === -1) return 1;
    
      // Else compare based on the sectionOrder array
      return firstSectionIndex - secondSectionIndex;
  }) : [];

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
        window.scrollTo(0, 0); // Scroll to top

        if(response.ok) {
          setAlert({ visible: true, variant: 'success', message: 'Revisión guardada con éxito.' });
        } else {
          setAlert({ visible: true, variant: 'danger', message: 'No se pudo guardar la revisión. Inténtalo de nuevo.' });
        }
        setTimeout(()=> setAlert({visible: false, variant: '', message: ''}), 1200)

        console.log(data); 
    };

    const updateReview = (section, reviewSection) => {
        setReview(prevReview => ({ ...prevReview, [section]: reviewSection }));
    };

    return (
        <>
        <Row>
        {alert.visible && <Alert variant={alert.variant}>{alert.message}</Alert>}
        </Row>
          <Row className="justify-content-between mb-4">
          <Col xs="auto">
            <Button className="btn bg-secondary" onClick={goBack}>Volver Atrás</Button>
          </Col>
          <Col>
          <RegenerationModal username={username} articleTitle={article_title}/>

          </Col>
          <Col xs="auto">
          <DownloadArticle
                pdf={`/file/${article.submitted_pdf_id}`}
                title={article.title}
                zip={`/zip/${article.latex_project_id}`}/>
          </Col>
        </Row>
        <Row className='mb-5 px-3'>
        <Card style={{ width: '100%' }}>
            <Card.Body>
                <Card.Title>{article.title}</Card.Title>
                <Card.Text>{article.description}</Card.Text>
                <Accordion defaultActiveKey={"Introduction"}>
                  {article && article.summary && Object.keys(article.summary).length > 0 && sortSections.map(([section, summarySection]) => (
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
