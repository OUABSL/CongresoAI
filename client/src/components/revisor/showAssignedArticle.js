import React, { useState, useEffect, useContext } from 'react';
import { Button, Card, Accordion, Row, Modal, Col, DropdownButton, Dropdown, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from "../../context/context";
import { AlertContext } from '../../context/alertProvider';
import RegenerationModal from './regeneratePreEvaluation'
import ReassignateReviewButton from './reAssignateReviewer';

// Constant criteria and scale
const CRITERIA = ['Motivation', 'Novelty', 'Clarity', 'Grammar and Style', 'Typos and Errors'];
const CRITERIA_API = ['motivation', 'novelty', 'clarity', 'grammar_style', 'typos_errors'];
const SCALE = ['YES', 'Can be improved', 'Must be Improved', 'Not Applicable'];
const defaultReviewSection = { 'motivation': '', 'novelty': '', 'clarity': '', 'grammar_style': '', 'typos_errors': '', 'comment': '' };
const STATES_REVIEW = ["Pendiente de Revisión", "Aprobado", "Rechazado", "Pendiente de Mejora"];
const STATES_REVIEW_API =  ["Pending Review", "Approved", "Rejected", "Pending Improvement"]


const DownloadArticle = ({ pdf, zip, title }) => {

    const handleDownload = async (fileUrl, filename, type) => {
        try {
            const response = await fetch(`/api/v1${fileUrl}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const blob = await response.blob();
            const fileBlob = new Blob([blob], { type: type });
            const url = window.URL.createObjectURL(fileBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filename}.${type==='application/pdf'?'pdf':'zip'}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error(`Error fetching ${type==='application/pdf'?'PDF':'Zip'}: `, error);
        }
    };
  
    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <DropdownButton id="dropdown-button" title="Descargar">
                <Dropdown.Item onClick={() => handleDownload(pdf, title, 'application/pdf')}>Descargar PDF</Dropdown.Item>
                <Dropdown.Item onClick={() => handleDownload(zip, title, 'application/zip')}>Descargar ZIP</Dropdown.Item>
            </DropdownButton>
        </div>
    )
};



const formatPreEvalSection = (preEvalSection) => {
  if (!preEvalSection) return '';

  let formattedPreEvalSection = preEvalSection.replace(/\d+\./g, '');
  CRITERIA.forEach(criterion => {
      formattedPreEvalSection = formattedPreEvalSection.replaceAll(`${criterion}:`, `<br/><b>${criterion}:</b><br/>`);
  });

  return formattedPreEvalSection;
};


const SectionReview = ({ reviewData, sectionName, handleSectionUpdate, handleEdit, editing}) => {
    const [sectionReview, setSectionReview] = useState(reviewData || {});
    const [previousReviews, setPreviousReviews] = useState({});

    useEffect(() => {
        setSectionReview(reviewData);
    }, [reviewData]);

    useEffect(() => {
        if (reviewData && reviewData && reviewData !== defaultReviewSection && previousReviews[sectionName]!==reviewData ) {
          setPreviousReviews(prevReviews => ({
            ...prevReviews, 
            [sectionName]: reviewData
          }));

        }
      }, [reviewData, sectionName, previousReviews]);
      
      useEffect(() => {
        if (previousReviews && previousReviews[sectionName] && previousReviews[sectionName] !== defaultReviewSection) {
          handleEdit(false);
        }
      }, [previousReviews, sectionName, handleEdit]);




      const handleSectionReviewSave = (updatedReview) => {
        setSectionReview(updatedReview);
        handleSectionUpdate(sectionName, updatedReview);
        setPreviousReviews(prevState => {
          const updatedPreviousReviews = { ...prevState, [sectionName]: updatedReview };
          return updatedPreviousReviews;
        });
        handleEdit(true); 
      };

    const handleInputChange = (criterion, value) => {
        const updatedReview = { ...sectionReview, [criterion]: value };
        setSectionReview(updatedReview);
    };

    const handleClickSaveReview = () => {
        handleSectionReviewSave(sectionReview);
    };

    return (
        <div>
            {editing ? (
                    <>
                    {CRITERIA.map((criterion, i) => (
                        <Row key={criterion} className="align-items-center my-2">
                            <Col xs={12} md={4}>
                                <h6>{criterion}</h6>
                            </Col>
                            <Col xs={12} md={8}>
                                {SCALE.map((evalScale, index) => (
                                    <Form.Check
                                        inline
                                        label={evalScale}
                                        name={CRITERIA_API[i]}
                                        type="radio"
                                        id={`radio-${sectionName}-${CRITERIA_API[i]}`}
                                        value={evalScale}
                                        checked={sectionReview[CRITERIA_API[i]] === evalScale}
                                        onChange={() => handleInputChange(CRITERIA_API[i], evalScale)}
                                        key={`<span class="math-inline">${sectionName}-</span>${criterion}-${index}`}
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
                            value={sectionReview.comment || ''}
                            onChange={(e) => handleInputChange('comment', e.target.value)}
                        />
                    </Form.Group>
                    <Button
                        variant="primary"
                        onClick={handleClickSaveReview}
                        className="mt-3"
                    >
                        Guardar Revisión de Sección
                    </Button>
                </>
            ) : (
                <>
                <Card className="mt-3">
                    <Card.Header>Resumen de la revisión anterior:</Card.Header>
                    <Card.Body>
                        {
                            previousReviews && previousReviews[sectionName] && (
                                <div className="mt-3">
                                    {CRITERIA.map((criterion, i) => (
                                        <p key={criterion}>
                                            <b>{criterion}: </b>
                                            {previousReviews[sectionName][CRITERIA_API[i]]}
                                        </p>
                                    ))}
                                    <p>
                                        <b>Comentario del Revisor: </b>
                                        {previousReviews[sectionName].comment}
                                    </p>
                                </div>
                            )
                        }
                    </Card.Body>
                </Card>
                <Button
            variant="primary"
            onClick={() => handleEdit(true)}
            className="mt-3"
            >
                Editar Revisión
            </Button>
            </>
            )}

        </div>
    );
};


const DisplaySection = ({ sectionName, summarySection=null, preEvalSection=null, actualReviewSection=null, handleSectionUpdate=null }) => {
    const [reviewSection, setReviewSection] = useState(actualReviewSection || defaultReviewSection);
    const [editing, setEditing] = useState(true);
    const [formattedPreEvalSection, setFormattedPreEvalSection] = useState("");

    const handleEdit = (value) => {
        setEditing(value);
    };

    useEffect(() => {
        if (actualReviewSection) {
          setReviewSection(actualReviewSection);
        }
      }, [actualReviewSection, sectionName]);


    useEffect(()=> {
        if(preEvalSection){
            let preEvalSplit = preEvalSection.split("Evaluation Summary:", 2);
            setFormattedPreEvalSection(formatPreEvalSection(preEvalSplit[0], preEvalSplit[1]));
        }
    }, [preEvalSection])


    return (
        <Accordion.Item eventKey={sectionName}>
            <Accordion.Header>{sectionName}</Accordion.Header>
            <Accordion.Body>
                <h5>Resumen</h5>
                <p>{summarySection}</p>
                <h5>PreEvaluación</h5>
                <p dangerouslySetInnerHTML={{ __html: formattedPreEvalSection }} />
                <h5>Revisión</h5>
                <SectionReview
                    reviewData={reviewSection}
                    sectionName={sectionName}
                    handleSectionUpdate={handleSectionUpdate} 
                    handleEdit={handleEdit}
                    editing = {editing}
                />
            </Accordion.Body>
        </Accordion.Item>
    );
};



function ShowAssignedArticle() {
    const { sessionToken, logout } = useContext(AuthContext); // Accede a username y sessionToken desde el contexto
    const { username, article_title } = useParams();
    const [article, setArticle] = useState({});
    const [review, setReview] = useState({});
    const [resultReview, setResultReview] = useState({});
    const {alert, setAlert} = useContext(AlertContext);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    }

    const updateSectionReview = (sectionName, updatedReview) => {
      setReview({ ...review, [sectionName]: updatedReview });
  };



  useEffect(() => {
    async function fetchArticle() {
        try {
            const response = await fetch(`/api/v1/evaluate/${username}/${encodeURIComponent(article_title)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`,
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // llamadas de función o asignaciones que dependan de estas propiedades.
            if (data && data.submitted_pdf_id && data.title && data.description) {
                await setArticle(data);
                // llamar a la función handleShowPdf
                //await handleShowPdf(`/file/${data.submitted_pdf_id}`); 
            } else {
                throw new Error('Data received is not as expected');
            }
            
        } catch (error) {
            // Manejar errores de red y respuestas no esperadas
            // Deberías establecer un estado para mostrar el mensaje de error
            console.log("There was an error!", error);
        }
    }

    fetchArticle();
}, [username, article_title, sessionToken, logout]);


    const handleStateSelect = (state) => {
        const index = STATES_REVIEW.indexOf(state);
        const enState = STATES_REVIEW_API[index] || 'Error: Pending Review';
        setResultReview(enState);
    };


    const addReview = async () => {
        const reviewData = {
            review: review, // review is an object where the key is the section name and the value is the review of that section
            review_result: resultReview // resultReview is a string that represents the status: "Pending Review", "Approved", "Rejected", "Pending Improvement"
        };
        console.log("Posteed: ", resultReview, review);

        const response = await fetch(`/api/v1/evaluate/${username}/${article_title}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });
        const data = await response.json();
        setShowModal(false);
        window.scrollTo(0, 0); // Scroll to top

        if (data.success) {
            setAlert({ visible: true, variant: 'success', message: 'Revisión guardada con éxito.' });
        } else {
            setAlert({ visible: true, variant: 'danger', message: 'No se pudo guardar la revisión. Inténtalo de nuevo.' });
        }

        setTimeout(() => setAlert({ visible: false, variant: '', message: '' }), 1200)


    };




    return (
        <>
            <Row className="justify-content-between mb-4">
                <Col xs="auto">
                    <Button className="btn bg-secondary" onClick={goBack}>Volver Atrás</Button>
                </Col>
                <Col xs="auto">
                    <RegenerationModal username={username} articleTitle={article_title} />
                </Col>
                <Col xs="auto">
                    <ReassignateReviewButton username={username} articleTitle={article_title} setAlert={setAlert} />
                </Col>
                <Col xs="auto">
                    <DownloadArticle
                        pdf={`/file/${article.submitted_pdf_id}`}
                        title={article.title}
                        zip={`/zip/${article.latex_project_id}`} />
                </Col>
            </Row>
            <Row className='mb-5 px-3'>
                <Card style={{ width: '100%' }}>
                    <Card.Body>
                        {article && article.title && <Card.Title>{article.title}</Card.Title>}
                        {article && article.description && <Card.Text>{article.description}</Card.Text>}
                        {article && article.sections_orden && (
                            <Accordion defaultActiveKey={article.sections_orden[0]}>
                                {article.sections_orden.map((sectionName) => (
                                    <DisplaySection
                                        key={sectionName}
                                        sectionName={sectionName}
                                        summarySection={article.summary && article.summary[sectionName]}
                                        preEvalSection={article.evaluation && article.evaluation[sectionName]}
                                        actualReviewSection={article.review && article.review[sectionName]}
                                        handleSectionUpdate={updateSectionReview}
                                    />
                                ))}
                            </Accordion>
                        )}
                        <Button className="btn bg-info mt-3" variant="primary" onClick={() => setShowModal(true)}>
                            Guardar Revisión
                        </Button>
                        <Modal
                            show={showModal}
                            onHide={() => setShowModal(false)}
                        >
                            <Modal.Header closeButton>
                                <Modal.Title>Elige un estado para la revisión</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {STATES_REVIEW.map((state, index) => (
                                    <Form.Check 
                                        type="radio"
                                        key={`i-${index}`}
                                        name="reviewState" 
                                        id={`radio-${state}`}
                                        label={state}
                                        value={state}
                                        onChange={e => handleStateSelect(e.target.value)}
                                    />
                                ))}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowModal(false)}>
                                    Close
                                </Button>
                                <Button variant="primary" onClick={addReview}>
                                    Confirmar Elección
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </Card.Body>
                </Card>
            </Row>
        </>
    );
}

export default ShowAssignedArticle;
