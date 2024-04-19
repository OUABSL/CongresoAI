import React, { useState, useEffect, useContext } from 'react';
import { Button, Card, Accordion, Row, Modal, Col, DropdownButton, Dropdown, Alert, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from "../../context/context";
import RegenerationModal from './regeneratePreEvaluation'
import ReassignateReviewButton from './reAssignateReviewer';

// Constant criteria and scale
const CRITERIA = ['Motivation', 'Novelty', 'Clarity', 'Grammar and Style', 'Typos and Errors'];
const CRITERIA_API = ['motivation', 'novelty', 'clarity', 'grammar_style', 'typos_errors'];
const SCALE = ['YES', 'Can be improved', 'Must be Improved', 'Not Applicable'];
const SECTION_ORDER = ["Abstract", "Introduction", "Related Work", "Conclusions and future works"];
const defaultReviewSection = { 'motivation': '', 'novelty': '', 'clarity': '', 'grammar_style': '', 'typos_errors': '', 'comment': '' };
const STATES_REVIEW = ["Pendiente de Revisión", "Aprobado", "Rechazado", "Pendiente de Mejora"];
const STATES_REVIEW_API = ["Pendiente de Revisión", "Aprobado", "Rechazado", "Pendiente de Mejora"];


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
      formattedPreEvalSection = formattedPreEvalSection.replaceAll(criterion,":", `<br/><b>${criterion}+":"</b><br/>`);
  });

  return formattedPreEvalSection;
};


const SectionReview = ({ reviewData, sectionName, handleSectionReviewSave, handleSectionUpdate }) => {
    const [sectionReview, setSectionReview] = useState(reviewData);
    const [previousReview, setPreviousReview] = useState(null);
    const [editing, setEditing] = useState(true);

    useEffect(() => {
        setPreviousReview(reviewData);
    }, [reviewData]);


    useEffect(() => {
        setSectionReview(reviewData);
        console.log("sectionReview actualizado:", reviewData);
    }, [reviewData]);


    const handleInputChange = (criterion, value) => {
        const updatedReview = { ...sectionReview, [criterion]: value };
        setSectionReview(updatedReview);
        console.log("sectionReview actualizado en handleInputChange:", updatedReview);

    };

    const handleClickSaveReview = () => {
        handleSectionReviewSave(sectionReview);
        handleSectionUpdate(sectionName, sectionReview);
        setEditing(false);
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
                                        id={`radio-${CRITERIA_API[i]}-${evalScale}`}
                                        value={evalScale}
                                        checked={sectionReview[CRITERIA_API[i]] === evalScale}
                                        onChange={() => handleInputChange(CRITERIA_API[i], evalScale)}
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
                            previousReview && (
                                <div className="mt-3">
                                    {CRITERIA.map((criterion, i) => (
                                        <p key={criterion}>
                                            <b>{criterion}: </b>
                                            {previousReview[CRITERIA_API[i]]}
                                        </p>
                                    ))}
                                    <p>
                                        <b>Comentario del Revisor: </b>
                                        {previousReview.comment}
                                    </p>
                                </div>
                            )
                        }
                    </Card.Body>
                </Card>
                <Button
            variant="primary"
            onClick={() => setEditing(true)}
            className="mt-3"
            >
                Editar Revisión
            </Button>
            </>
            )}

        </div>
    );
};


const DisplaySection = ({ sectionName, summarySection, preEvalSection, actualReviewSection, handleSectionUpdate }) => {
    const [reviewSection, setReviewSection] = useState(actualReviewSection || defaultReviewSection);
    const [editing, setEditing] = useState(true);

    useEffect(() => {
        if (actualReviewSection) {
            setReviewSection(actualReviewSection);
        }
    }, [actualReviewSection]);

    const handleSectionReviewSave = (updatedReview) => {
      setReviewSection(updatedReview);
      setEditing(!editing);
      handleSectionUpdate(sectionName, updatedReview);
      console.log("Review: handleInputChange: ", reviewSection , "\n\n");

  };

    const handleEdit = () => {
        setEditing(true);
    };

    let preEvalSplit = preEvalSection.split("Evaluation Summary:", 2);
    const formattedPreEvalSection = formatPreEvalSection(preEvalSplit[0], preEvalSplit[1]);

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
                    handleSectionReviewSave={handleSectionReviewSave}
                    handleSectionUpdate={handleSectionUpdate} 
                />
            </Accordion.Body>
        </Accordion.Item>
    );
};



function ShowAssignedArticle() {
    const STATES_REVIEW = ["Pendiente de Revisión", "Aprobado", "Rechazado", "Pendiente de Mejora"];
    const { sessionToken, logout } = useContext(AuthContext); // Accede a username y sessionToken desde el contexto
    const { username, article_title } = useParams();
    const [article, setArticle] = useState({});
    const [review, setReview] = useState({});
    const [resultReview, setResultReview] = useState({});
    const [alert, setAlert] = useState({ visible: false, variant: '', message: '' });
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
            const response = await fetch(`/api/v1/evaluate/${username}/${encodeURIComponent(article_title)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`,
                }
            });

            if (response.status === 401) {
                logout();
                return;
            }
            const data = await response.json();
            setArticle(data);
            // Agrega la línea para llamar a la función handleShowPdf
            //await handleShowPdf(`/file/${data.submitted_pdf_id}`);
        }

        fetchArticle();
    }, [username, article_title, sessionToken, logout]);


    const handleStateSelect = (state) => {
        let enState;
        switch(state) {
          case "Pendiente de Revisión":
            enState = "Pending Review";
            break;
          case "Aprobado":
            enState = "Approved";
            break;
          case "Rechazado":
            enState = "Rejected";
            break;
          case "Pendiente de Mejora":
            enState = "Pending Improvement";
            break;
          default:
            enState = "";
            break;      
        }
        setResultReview(enState);
      };

    const sortSections = article.summary ? Object.entries(article.summary).sort(([firstSection], [secondSection]) => {
        const firstSectionIndex = SECTION_ORDER.indexOf(firstSection);
        const secondSectionIndex = SECTION_ORDER.indexOf(secondSection);

        // If the section is not in the sectionOrder array, find it after the specified sections
        if (secondSectionIndex === -1) return -1;
        if (firstSectionIndex === -1) return 1;

        // Else compare based on the sectionOrder array
        return firstSectionIndex - secondSectionIndex;
    }) : [];


    const addReview = async () => {
        const reviewData = {
            review: review, // review is an object where the key is the section name and the value is the review of that section
            review_result: resultReview // resultReview is a string that represents the status: "Pending Review", "Approved", "Rejected", "Pending Improvement"
        };
        const response = await fetch(`/api/v1/evaluate/${username}/${article_title}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });
        const data = await response.json();
        setShowModal(false);
        window.scrollTo(0, 0); // Scroll to top

        if (response.ok) {
            setAlert({ visible: true, variant: 'success', message: 'Revisión guardada con éxito.' });
        } else {
            setAlert({ visible: true, variant: 'danger', message: 'No se pudo guardar la revisión. Inténtalo de nuevo.' });
        }

        setTimeout(() => setAlert({ visible: false, variant: '', message: '' }), 1200)


        console.log("Posteed: ", data);
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
                        <Card.Title>{article.title}</Card.Title>
                        <Card.Text>{article.description}</Card.Text>
                        <Accordion defaultActiveKey={"Introduction"}>
                            {article && article.summary && Object.keys(article.summary).length > 0 && sortSections.map(([sectionName, summarySection]) => (
                                <DisplaySection
                                    key={sectionName}
                                    sectionName={sectionName}
                                    summarySection={summarySection}
                                    preEvalSection={article.evaluation[sectionName]}
                                    actualReviewSection={article.review && article.review[sectionName] ? article.review[sectionName] : null}
                                    handleSectionUpdate={updateSectionReview}
                                />
                            ))}
                        </Accordion>
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
                                    name={state}
                                    id={`radio-${state}`}
                                    label={state}
                                    value={state}
                                    onChange={(s) => handleStateSelect(s)}
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
