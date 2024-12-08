import React, { useState, useEffect, useContext } from 'react';
import { Card, Accordion, DropdownButton, Dropdown, Row, Col, Button} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthContext from "../../context/context";
import { AlertContext } from '../../context/alertProvider';
import "../estilos/showArticle.css";

const STATES_REVIEW_API = ["Pending Review", "Approved", "Rejected", "Pending Improvement"];
const STATES_REVIEW_SPANISH = ["Pendiente de Revisión", "Aprobado", "Rechazado", "Pendiente de Mejora"];

const reviewStatusColors = {
  "Pendiente de Revisión": "blue",
  "Aprobado": "green",
  "Rechazado": "red",
  "Pendiente de Mejora": "orange"
};

const NavigateToSubmitButton = ({ article }) => {
  const { t } = useTranslation(); // Función t de i18next
  const navigate = useNavigate();
  const comments = {};
  Object.entries(article.review).forEach(([sectionName, sectionReview]) => (
    comments[sectionName] = sectionReview.comment
  ));
  const handleOnClick = () => {
    navigate('/portal-author/submit?state=resubmit', { 
      state: { 
        isResubmit: true, 
        comments: comments, 
        article: article
      } 
    });
  }
  return <Button onClick={handleOnClick}>{t('navigateToSubmitButton.label')}</Button>;
};

const DownloadArticle = ({ pdf, zip, title }) => {
  const { t } = useTranslation(); // Función t de i18next

  const handleDownload = async (fileUrl, filename, type) => {
    try {
      const response = await fetch(`/api/v1${fileUrl}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${result.status}`);
      }
      const blob = await response.blob();
      const fileBlob = new Blob([blob], { type: type });
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.${type === 'application/pdf' ? 'pdf' : 'zip'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error(`Error fetching ${type === 'application/pdf' ? 'PDF' : 'Zip'}: `, error);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <DropdownButton id="dropdown-button" title={t('downloadArticle.label')}>
        <Dropdown.Item onClick={() => handleDownload(pdf, title, 'application/pdf')}>{t('downloadArticle.pdf')}</Dropdown.Item>
        <Dropdown.Item onClick={() => handleDownload(zip, title, 'application/zip')}>{t('downloadArticle.zip')}</Dropdown.Item>
      </DropdownButton>
    </div>
  );
};



const DisplaySectionReview = ({ sectionName, review }) => {
  const { t } = useTranslation(); // Función t de i18next

  return (
    <Accordion.Item eventKey={sectionName}>
      <Accordion.Header>{sectionName}</Accordion.Header>
      <Accordion.Body>
        {review && Object.keys(review).length > 0 &&
          Object.entries(review)
            .filter(([criterion, _]) => criterion !== "comment")
            .map(([criterion, result]) => (
              <p key={criterion}><strong>{criterion}:</strong> {result}</p>
            ))
        }
        {review && review.comment && (
          <Card style={{ marginTop: '15px' }}>
            <Card.Body>
              <Card.Title>{t('displaySectionReview.commentTitle')}</Card.Title>
              <Card.Text>{review.comment}</Card.Text>
            </Card.Body>
          </Card>
        )}
      </Accordion.Body>
    </Accordion.Item>
  );
};




const getArticle = async (username, articleTitle, sessionToken, onLogout) => {
  try {
    const response = await fetch(`/api/v1/submit/${username}/${encodeURIComponent(articleTitle)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      }
    });

    const data = await response.json();


    if (data.status === 401) {
      onLogout();
      return;
    }

    return data;

  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}


const ShowSubmittedArticle = () => {
  const { t } = useTranslation(); // Función t de i18next
  const { sessionToken, logout, username } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const { article_title } = useParams();
  const [article, setArticle] = useState({});
  const [review, setReview] = useState({});
  const [activeKey, setActiveKey] = useState("start");
  const [resultReview, setResultReview] = useState("");
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  }

  useEffect(() => {
    document.title = `Artículos presentados ${username}`;
  }, [username]);
  
  useEffect(()=> {
    if(article.review){
        setReview(article.review);
    }
  }, [article]);

  useEffect(() => {
    if(username && article_title && sessionToken){
      getArticle(username, article_title, sessionToken, logout).then(setArticle);
    }
  }, [username, article_title, sessionToken, logout]);

  useEffect(()=> {
    if (article && article.sections_orden) {
        setResultReview(article.review_result);
        if(article.sections_orden.length > 0 && activeKey === "start") setActiveKey(article.sections_orden[0]);       
    }
  }, [article, activeKey]);

  const translateReviewStatus = (status) => {
    const index = STATES_REVIEW_API.findIndex(s => s === status);
    return STATES_REVIEW_SPANISH[index] || status; // Fallback to the original status if not found
  };

  return (
    <>
    <Row className="justify-content-between mb-4">
      <Col xs="auto" className='mt-1'>
          <Button className="btn bg-secondary" onClick={goBack}>{t('showSubmittedArticle.backButton')}</Button>
      </Col>
      <Col xs="auto" className='mt-1'>
        {article.review_result === 'Pending Improvement' && 
        <NavigateToSubmitButton article={article} />}
      </Col>
      <Col xs="auto" className='mt-1'>
        <DownloadArticle
            pdf={`/file/${article.submitted_pdf_id}`}
            title={article.title}
            zip={`/zip/${article.latex_project_id}`} />
      </Col>
    </Row>
    <Card className='tarjeta'>
      <Card.Body>
        <Card.Title className='h2 text-center'>{article.title}</Card.Title>
        <Card.Subtitle><b>{t('showSubmittedArticle.reviewer')} </b>{article.reviewer}</Card.Subtitle>
        {article.review_result && (
          <Card.Subtitle className=" d-flex flex-row mt-1"><b>{t('showSubmittedArticle.reviewResult')}: </b> <div style={{marginLeft:"5px", color: reviewStatusColors[translateReviewStatus(article.review_result)] || 'black' }}>{translateReviewStatus(article.review_result)}</div></Card.Subtitle>
        )}
        {article && article.is_resubmited === true && <Card.Text><b>{t('showSubmittedArticle.submitNumber')}: </b>{article.submit_number}</Card.Text>}
        <Card.Text><b>{t('showSubmittedArticle.description')}: </b>{article.description}</Card.Text>
        {article && article.sections_orden && (
              <Accordion activeKey={activeKey} onSelect={setActiveKey}>
                  {article.sections_orden.map((sectionName) => (
                      <DisplaySectionReview
                          key={sectionName}
                          sectionName={sectionName}
                          review={review.hasOwnProperty(sectionName)? review[sectionName] : {}}
                      />
                  ))}
              </Accordion>
          )}
      </Card.Body>
    </Card>
    </>
  );
};

export default ShowSubmittedArticle;