import React, { useState, useEffect } from 'react';
import { Card, Accordion } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import AuthContext from "../../context/context";
import { useContext } from "react";

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

const ShowSubmittedArticle = () => {
  const { sessionToken, logout, username } = useContext(AuthContext);
  const { article_title } = useParams();
  const [article, setArticle] = useState({});
  const [review, setReview] = useState ({});

  useEffect(()=> {
    setReview(article.review);
  }, [article.review]);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const response = await fetch(`/api/v1/submit/${username}/${encodeURIComponent(article_title)}`, {
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
      } catch (error) {
        console.error('Error fetching article:', error);
      }
    }

    fetchArticle();
  }, [username, article_title, sessionToken, logout]);

  return (
    <Card style={{ width: '100%' }}>
      <Card.Body>
        <Card.Title>{article.title}</Card.Title>
        <Card.Text>{article.description}</Card.Text>
        <Accordion defaultActiveKey={"Introduction"}>
          {article && review && Object.keys(review).length > 0 &&
            Object.entries(review).map(([sectionName, sectionReview]) => (
              <DisplaySectionReview key={sectionName} sectionName={sectionName} review={sectionReview} />
            ))
          }
        </Accordion>
      </Card.Body>
    </Card>
  );
};

export default ShowSubmittedArticle;
