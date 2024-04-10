import React, { useState, useEffect, useContext } from 'react';
import {Button, Card, Accordion, Row, Col, DropdownButton, Dropdown, Alert, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from "../../context/context";
import RegenerationModal from './regeneratePreEvaluation'
import ReassignateReviewButton from './reAssignateReviewer';

// Constant criteria and scale
const CRITERIA = ['Motivation', 'Novelty', 'Clarity', 'Grammar and Style', 'Typos and Errors'];
const SCALE = ['YES', 'Can be improved', 'Must be Improved', 'Not Applicable'];
const SECTION_ORDER = ["Abstract", "Introduction", "Related Word", "Conclusions and future works"];
const defaultReviewSection = {
  'Motivation': '',
  'Novelty': '', 
  'Clarity': '',
  'Grammar and Style': '',
  'Typos and Errors': '',
  'comment': ''
};


const handleDownload = async (fileUrl, filename, filetype) => {
  try {
      const response = await fetch(`/api/v1${fileUrl}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const blob = await response.blob();
      const fileBlob = new Blob([blob], { type: `application/${filetype}` });
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.${filetype}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
  } catch (error) {
      console.error(`Error fetching ${filetype.toUpperCase()} file:`, error);
  }
};


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



const formatPreEvalSection = (preEvalSection) => {
    if(!preEvalSection) return '';

    let formattedPreEvalSection = preEvalSection.replace(/\d+\./g, ''); 
    CRITERIA.forEach(criterion => {
        formattedPreEvalSection = formattedPreEvalSection.replaceAll(criterion,
        `<br/><b>${criterion}</b><br/>`);
    });

    return formattedPreEvalSection;
};


const Review = ({ reviewData, handleSectionReviewSave }) => {
  const [review, setReview] = React.useState(reviewData);

  const handleInputChange = (e, criterion) => {
      const updatedReview = { ...review, [criterion]: e.target.value };
      setReview(updatedReview);
      console.log(updatedReview); 
  };

  const handleClickSaveReview = () => {
    handleSectionReviewSave(review);
  };

  return (
      <div>
          {CRITERIA.map(criterion => (
              <Row key={criterion} className="align-items-center my-2">
                  <Col xs={12} md={4}>
                      <h6>{criterion}</h6>
                  </Col>
                  <Col xs={12} md={8}>
                {SCALE.map((evalScale, index) => (
                    <Form.Check 
                        inline 
                        label={evalScale} 
                        name={criterion} 
                        type="radio" 
                        id={`radio-${criterion}-${evalScale}`}
                        value={evalScale} 
                        checked={review[criterion] === evalScale} 
                        onChange={(e) => handleInputChange(e, criterion)}
                        key={`${criterion}-${index}`}
                    />
                ))}
            </Col>
              </Row>
          ))}
          <Form.Group controlId="reviewComment" className="mt-3">
              <Form.Label>Comentario del Revisor</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={review.comment || ''} 
                onChange={(e) => handleInputChange(e, 'comment')}
              />
          </Form.Group>
          <Button 
            variant="primary" 
            onClick={handleClickSaveReview} 
            className="mt-3"
          >
            Guardar Revisión de Sección
          </Button>
      </div>
  );
};

const DisplaySection = ({ section, summarySection, preEvalSection, actualReviewSection }) => {
  const [reviewSection, setReviewSection] = useState(defaultReviewSection);
  const [editing, setEditing] = useState(true);
  
  if(actualReviewSection!=null){
    setReviewSection(actualReviewSection);
  }


  const handleSectionReviewSave = (updatedReview) => {
    setReviewSection(updatedReview);
    setEditing(!editing);
  };

  
  const handleEdit = () => {
      setEditing(true);
  };
  
  let preEvalSplit = preEvalSection.split("Evaluation Summary:", 2);
  const formattedPreEvalSection = formatPreEvalSection(preEvalSplit[0], preEvalSplit[1]);

  return (
    <Accordion.Item eventKey={section}>
        <Accordion.Header>{section}</Accordion.Header>
        <Accordion.Body>
            <h5>Resumen</h5>
            <p>{summarySection}</p>
            <h5>PreEvaluación</h5>
            <p dangerouslySetInnerHTML={{ __html: formattedPreEvalSection }} />
            <h5>Revisión</h5>
            <Review reviewData={reviewSection} handleSectionReviewSave={handleSectionReviewSave}/>
        </Accordion.Body>
    </Accordion.Item>
);
}


function ShowAssignedArticle() {
    const {sessionToken, logout} = useContext(AuthContext); // Accede a username y sessionToken desde el contexto
    const { username, article_title } = useParams();
    const [article, setArticle] = useState({});
    const [review, setReview] = useState({});
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
            //await handleShowPdf(`/file/${data.submitted_pdf_id}`);
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


    return (
        <>
        <Row>
        {alert.visible && <Alert variant={alert.variant}>{alert.message}</Alert>}
        </Row>
          <Row className="justify-content-between mb-4">
          <Col xs="auto">
            <Button className="btn bg-secondary" onClick={goBack}>Volver Atrás</Button>
          </Col>
          <Col xs="auto">
          <RegenerationModal username={username} articleTitle={article_title}/>
          </Col>
          <Col xs="auto">
          <ReassignateReviewButton username={username} articleTitle={article_title} setAlert={setAlert}/>  
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
                        reviewSection={article.review && article.review[section] ? article.review[section] : null}
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

export default ShowAssignedArticle;