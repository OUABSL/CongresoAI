import React, { useState, useEffect } from 'react';
import { Card, Accordion, DropdownButton, Dropdown, Row, Col, Button} from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from "../../context/context";
import { useContext } from "react";


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
          Object.entries(review).map(([criterion, result]) => (
            <p key={criterion}><strong>{criterion}:</strong> {result}</p>
          ))
        }
        <Card style={{ marginTop: '15px' }}>
          <Card.Body>
            <Card.Title>Comment</Card.Title>
            <Card.Text>{review && review.comment}</Card.Text>
          </Card.Body>
        </Card>
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
  const { article_title } = useParams();
  const [article, setArticle] = useState({});
  const [review, setReview] = useState ({});
  const navigate = useNavigate();


  
  const goBack = () => {
    navigate(-1);
  }

  useEffect(()=> {
    setReview(article.review);
  }, [article.review]);



  useEffect(() => {
    getArticle(username, article_title, sessionToken, logout).then(setArticle);
  }, [username, article_title, sessionToken, logout]);


  const reviewStatusColors = {
    "Pending Review": "blue",
    "Approved": "green",
    "Rejected": "red",
    "Pending Improvement": "orange"
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
            Review Result: {article.result_review}
          </Card.Text>
        )}

        <Accordion defaultActiveKey={"Introduction"}>
          {article && review && Object.keys(review).length > 0 &&
            Object.entries(review).map(([sectionName, sectionReview]) => (
              <DisplaySectionReview key={sectionName} sectionName={sectionName} review={sectionReview} />
            ))
          }
        </Accordion>
      </Card.Body>
    </Card>
    </>
  );
};

export default ShowSubmittedArticle;
