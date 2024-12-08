import React, { useState, useEffect, useContext } from 'react';
import { Button, Card, Accordion, Row, Modal, Col, DropdownButton, Dropdown, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthContext from "../../context/context";
import { AlertContext } from '../../context/alertProvider';
import RegenerationModal from './regeneratePreEvaluation'
import ReassignateReviewButton from './reAssignateReviewer';
import "../estilos/showArticle.css";

// Constant criteria and scale
const CRITERIA = ['Motivation', 'Novelty', 'Clarity', 'Grammar and Style', 'Typos and Errors'];
const CRITERIA_API = ['motivation', 'novelty', 'clarity', 'grammar_style', 'typos_errors'];
const SCALE = ['YES', 'Can be improved', 'Must be Improved', 'Not Applicable'];
const defaultReviewSection = { 'motivation': '', 'novelty': '', 'clarity': '', 'grammar_style': '', 'typos_errors': '', 'comment': '' };
const STATES_REVIEW = ["Pendiente de Revisión", "Aprobado", "Rechazado", "Pendiente de Mejora"];
const STATES_REVIEW_API =  ["Pending Review", "Approved", "Rejected", "Pending Improvement"]


const DownloadArticle = ({ pdf, zip, title }) => {
    const { t } = useTranslation();

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
        <div className="d-flex justify-content-end mt-1">
            <DropdownButton id="dropdown-button" title="Descargar">
                <Dropdown.Item onClick={() => handleDownload(pdf, title, 'application/pdf')}>{t('downloadArticle.pdf')}</Dropdown.Item>
                <Dropdown.Item onClick={() => handleDownload(zip, title, 'application/zip')}>{t('downloadArticle.zip')}</Dropdown.Item>
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


const SectionReview = ({ reviewData, sectionName, handleSectionUpdate, handleEdit, editing, isEdited}) => {
    const [sectionReview, setSectionReview] = useState(reviewData || {});
    const [previousReviews, setPreviousReviews] = useState({});
    const [first, setFirst] = useState(true);
    const { t } = useTranslation();


    useEffect(() => {
        setSectionReview(reviewData);
    }, [reviewData]);

    useEffect(() => {
        if (reviewData && !isEdited && reviewData !== defaultReviewSection && previousReviews[sectionName] !== reviewData) {
            setPreviousReviews(prevReviews => ({
                ...prevReviews,
                [sectionName]: reviewData
            }));
        }
    }, [reviewData, sectionName, previousReviews, isEdited]);

    useEffect(() => {
        if (first && previousReviews[sectionName] && previousReviews[sectionName] !== defaultReviewSection) {
            handleEdit(false);
            setFirst(false);
        }
    }, [previousReviews, handleEdit, sectionName, first]);




    const handleSectionReviewSave = (updatedReview) => {
        handleSectionUpdate(sectionName, updatedReview);
        setPreviousReviews(prevState => ({
            ...prevState,
            [sectionName]: updatedReview
        }));
        handleEdit(false);
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
                    <Form.Group controlId="reviewComment" className="mt-3 ">
                        <Form.Label>{t('showAssignedArticle.reviewerComment')}</Form.Label>
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
                        {t('showAssignedArticle.saveSectionReview')}
                    </Button>
                </>
            ) : (
                <>
                    <Card className="mt-3">
                        <Card.Header className="card-cabecera">{t('showAssignedArticle.previousReviewSummary')}:</Card.Header>
                        <Card.Body>
                            {previousReviews && previousReviews[sectionName] && (
                                <div className="mt-3">
                                    {CRITERIA.map((criterion, i) => (
                                        <p key={criterion}>
                                            <b>{criterion}: </b>
                                            {previousReviews[sectionName][CRITERIA_API[i]]}
                                        </p>
                                    ))}
                                    <p>
                                        <b>{t('showAssignedArticle.reviewerComment')}: </b>
                                        {previousReviews[sectionName].comment}
                                    </p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                    <Button
                        variant="primary"
                        onClick={() => handleEdit(true)}
                        className="mt-3"
                    >
                        {t('showAssignedArticle.editReview')}
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
    const [isEdited, setIsEdited] = useState(false);
    const { t } = useTranslation(); 

    const handleEdit = (value) => {
        if(!value) setIsEdited(true);
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
                <h5 className='text-center text-primary'><b>{t('showAssignedArticle.summary')}</b></h5>
                <p>{summarySection}</p>
                <h5 className='text-center text-primary'><b>{t('showAssignedArticle.initialEvaluation')}</b></h5>
                <p dangerouslySetInnerHTML={{ __html: formattedPreEvalSection }} />
                <h5 className='text-center text-primary'><b>{t('showAssignedArticle.review')}</b></h5>
                <SectionReview
                    reviewData={reviewSection}
                    sectionName={sectionName}
                    handleSectionUpdate={handleSectionUpdate} 
                    handleEdit={handleEdit}
                    editing={editing}
                    isEdited={isEdited}
                />
            </Accordion.Body>
        </Accordion.Item>
    );
};



function ShowAssignedArticle() {
    const { t } = useTranslation(); // Usar hook para la traducción
    const { sessionToken, logout } = useContext(AuthContext); 
    const { username, article_title } = useParams();
    const [article, setArticle] = useState({});
    const [review, setReview] = useState({});
    const [resultReview, setResultReview] = useState("");
    const { setAlert } = useContext(AlertContext);
    const [showModal, setShowModal] = useState(false);
    const [activeKey, setActiveKey] = useState("start");
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    }

    const updateSectionReview = (sectionName, updatedReview) => {
        setReview({ ...review, [sectionName]: updatedReview });
    };

    useEffect(() => {
        document.title = `Revisión - ${article_title}`;
    }, [article_title]);

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

                if (data && data.submitted_pdf_id && data.title && data.description) {
                    await setArticle(data);
                } else {
                    throw new Error('Data received is not as expected');
                }
                
            } catch (error) {
                setAlert({ show: true, variant: 'danger', message: t('showAssignedArticle.errorFetchingArticle') });
                console.log("There was an error!", error);
            }
        }
        fetchArticle();
    }, [username, article_title, sessionToken, logout, setAlert, t]); // Añadir 't' a las dependencias

    useEffect(() => {
        if (article && article.sections_orden) {
            setResultReview(article.review_result);
            if (article.sections_orden.length > 0 && activeKey === "start") setActiveKey(article.sections_orden[0]);
        }
    }, [article, activeKey]);

    const translateReviewStatus = (status, lang) => {
        if (lang === "EN") {
            const index = STATES_REVIEW.indexOf(status);
            const enState = STATES_REVIEW_API[index] || 'Error: Pending Review';
            setResultReview(enState);
        } else if (lang === "ES") {
            const index = STATES_REVIEW_API.findIndex(s => s === status);
            return STATES_REVIEW[index] || status; // Fallback to the original status if not found
        } else return status;
    };

    const addReview = async () => {
        const reviewData = {
            review: review,
            review_result: resultReview
        };

        const response = await fetch(`/api/v1/evaluate/${username}/${article_title}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
            },
            body: JSON.stringify(reviewData)
        });
        const data = await response.json();
        setActiveKey('');
        setShowModal(false);
        window.scrollTo(0, 0);

        if (data.success) {
            setAlert({ show: true, variant: 'success', message: t('showAssignedArticle.reviewSavedSuccess') });
        } else {
            setAlert({ show: true, variant: 'danger', message: t('showAssignedArticle.reviewSaveError') });
        }
    };

    return (
        <>
            <Row className="justify-content-between mb-4">
                <Col xs="auto" className='mt-1'>
                    <Button className="btn bg-secondary" onClick={goBack}>{t('showAssignedArticle.backButton')}</Button>
                </Col>
                <Col xs="auto" className='mt-1'>
                    <RegenerationModal username={username} articleTitle={article_title} />
                </Col>
                <Col xs="auto" className='mt-1'>
                    <ReassignateReviewButton username={username} articleTitle={article_title} />
                </Col>
                <Col xs="auto" className='mt-1'>
                    <DownloadArticle
                        pdf={`/file/${article.submitted_pdf_id}`}
                        title={article.title}
                        zip={`/zip/${article.latex_project_id}`} />
                </Col>
            </Row>
            <Row className='mb-5 px-3'>
                <Card className='tarjeta'>
                    <Card.Body>
                        {article && article.title && <Card.Title className='text-center h2'><h2>{article.title}</h2></Card.Title>}
                        {article && article.description && <Card.Text><b>{t('showAssignedArticle.description')}: </b>{article.description}</Card.Text>}
                        {article && article.submit_number && <Card.Text><b>{t('showAssignedArticle.submissionNumber')}: </b>{article.submit_number}</Card.Text>}
                        {article && article.is_resubmited === true && <Card.Text><b>{t('showAssignedArticle.previousReviewResult')}: </b>{translateReviewStatus(article.old_review_result, "ES")}</Card.Text>}
                        {article && resultReview !== "" && <Card.Text><b>{t('showAssignedArticle.reviewStatus')}: </b>{translateReviewStatus(resultReview, "ES")}</Card.Text>}
                        {article && article.sections_orden && (
                            <Accordion activeKey={activeKey} onSelect={setActiveKey}>
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
                            {t('showAssignedArticle.saveReview')}
                        </Button>
                        <Modal
                            show={showModal}
                            onHide={() => setShowModal(false)}
                        >
                            <Modal.Header closeButton>
                                <Modal.Title>{t('showAssignedArticle.chooseReviewStatus')}</Modal.Title>
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
                                        onChange={e => translateReviewStatus(e.target.value, "EN")}
                                    />
                                ))}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowModal(false)}>
                                    {t('showAssignedArticle.close')}
                                </Button>
                                <Button variant="primary" onClick={addReview}>
                                    {t('showAssignedArticle.confirmChoice')}
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
