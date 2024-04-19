import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Accordion, Alert, Col, Row, DropdownButton, Dropdown } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { Viewer } from '@react-pdf-viewer/core';
import AuthContext from "../../context/context";
import { useContext } from "react";

const DisplaySectionReview = ({ section, review }) => {
  return (
    <Accordion.Item eventKey={section}>
        <Accordion.Header>{section}</Accordion.Header>
        <Accordion.Body>
        {review && Object.keys(review).length > 0 &&
            Object.entries(review).map(([criterion, result]) => (
              <p key={criterion}><strong>{criterion}:</strong> {result}</p>
            ))
          }
          <Card style={{ marginTop: '15px' }}>
            <Card.Body>
              <Card.Title>Comment</Card.Title>
              <Card.Text>{review.comment}</Card.Text>
            </Card.Body>
          </Card>
        </Accordion.Body>
    </Accordion.Item>
  );
};

const ShowSubmittedArticle = () => {
  const { sessionToken, logout, username } = useContext(AuthContext);
  const { author, article_title } = useParams();  
  const [article, setArticle] = useState({});    

  useEffect(() => {
    async function fetchArticle() {
      const response = await fetch(`/api/v1/submit/${username}/${encodeURIComponent(article_title)}`, {
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
    }
    
    fetchArticle();
  }, [username, article_title, sessionToken, logout]);
 
  return (
    <Card style={{ width: '100%' }}>
      <Card.Body>
        <Card.Title>{article.title}</Card.Title>
        <Card.Text>{article.description}</Card.Text>
        <Accordion defaultActiveKey={"Introduction"}>
          {article && article.review && Object.keys(article.review).length > 0 &&
            Object.entries(article.review).map(([section, review]) => (
                <DisplaySectionReview key={section} section={section} content={review} />
            ))
          }
        </Accordion>
      </Card.Body>
    </Card>
  );
};

export default ShowSubmittedArticle;