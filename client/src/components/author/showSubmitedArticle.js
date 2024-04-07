import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Accordion, Alert, Col, Row, DropdownButton, Dropdown } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { Viewer } from '@react-pdf-viewer/core';
import AuthContext from "../../context/context";
import { useContext } from "react";

const DisplaySection = ({ section, content }) => {
  return (
    <Accordion.Item eventKey={section}>
        <Accordion.Header>{section}</Accordion.Header>
        <Accordion.Body>
            <p>{content}</p>
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
          {article && article.summary && Object.keys(article.summary).length > 0 &&
            Object.entries(article.summary).map(([section, content]) => (
                <DisplaySection key={section} section={section} content={content} />
            ))
          }
        </Accordion>
      </Card.Body>
    </Card>
  );
};

export default ShowSubmittedArticle;