import React, { useState, useEffect, useContext } from 'react';
import { Card, Accordion, DropdownButton, Dropdown, Row, Col, Button} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from "../../context/context";
import { AlertContext } from '../../context/alertProvider';


const STATES_REVIEW_API = ["Pending Review", "Approved", "Rejected", "Pending Improvement"];
const STATES_REVIEW_SPANISH = ["Pendiente de Revisión", "Aprobado", "Rechazado", "Pendiente de Mejora"];

const reviewStatusColors = {
  "Pendiente de Revisión": "blue",
  "Aprobado": "green",
  "Rechazado": "red",
  "Pendiente de Mejora": "orange"
};

const NavigateToSubmitButton = ({ article }) => {
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
  return <Button onClick={handleOnClick}>Resubmit Article</Button>;
};

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




const DisplaySectionReview = ({ sectionName, review }) => {
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
              <Card.Title>Commentario</Card.Title>
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

    if (response.status === 401) {
      onLogout();
      return;
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}


const ShowSubmittedArticle = () => {
  const { sessionToken, logout, username } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const { article_title } = useParams();
  const [article, setArticle] = useState({});
  const [review, setReview] = useState ({});
  const navigate = useNavigate();


  
  const goBack = () => {
    navigate(-1);
  }

  
  useEffect(() => {
    document.title = `Artículos presentados ${username}`;
  }, [username]);
  

  useEffect(()=> {
    setReview(article.review);
  }, [article.review]);



  useEffect(() => {
    getArticle(username, article_title, sessionToken, logout).then(setArticle);
  }, [username, article_title, sessionToken, logout]);





const translateReviewStatus = (status) => {
  const index = STATES_REVIEW_API.findIndex(s => s === status);
  return STATES_REVIEW_SPANISH[index] || status; // Fallback to the original status if not found
};


  return (
    <>
    <Row className="justify-content-between mb-4">
      <Col xs="auto">
          <Button className="btn bg-secondary" onClick={goBack}>Volver Atrás</Button>
      </Col>
      <Col xs="auto">
        {article.review_result === 'Pending Improvement' && 
        <NavigateToSubmitButton article={article} />}
      </Col>
      <Col xs="auto">
        <DownloadArticle
            pdf={`/file/${article.submitted_pdf_id}`}
            title={article.title}
            zip={`/zip/${article.latex_project_id}`} />
      </Col>
    </Row>
    <Card style={{ width: '100%' }}>
      <Card.Body>
        <Card.Title>{article.title}</Card.Title>
        <Card.Text>{article.description}</Card.Text>
        {article.result_review && (
          <Card.Text style={{ color: reviewStatusColors[article.result_review] || 'black' }}>
              Resultado de revisión: {translateReviewStatus(article.result_review)}
          </Card.Text>
        )}

          <Accordion defaultActiveKey={article.sections_order && article.sections_order[0]}>
            {article.sections_order && article.sections_order.map(sectionName => (
              <DisplaySectionReview key={sectionName} sectionName={sectionName} review={review[sectionName]} />
            ))}
          </Accordion>
      </Card.Body>
    </Card>
    </>
  );
};

export default ShowSubmittedArticle;
