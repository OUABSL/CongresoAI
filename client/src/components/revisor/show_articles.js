import React, { useState, useEffect } from 'react';
import { Table, Container} from 'react-bootstrap';
import { redirect, useParams, useNavigate } from 'react-router-dom';
import { useContext } from "react";
import AuthContext from "../../context/context";

import '../estilos/show_articles.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenClip, faSpinner, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

function ShowArticles() {
  const { username, sessionToken, logout } = useContext(AuthContext); // Access username from context
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      const response = await fetch(`/api/v1/evaluate/${username}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
      })

      if(response.status === 401) {
        logout();
        return;
      }


      const data = await response.json();
      setArticles(data);
    }
    fetchArticles()
  }, [username, sessionToken, logout])


  return (
    <Container className="my-5">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Título</th>
            <th>Descripción</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {articles.filter(article => article.description).map((article, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{article.title}</td>
        <td>{article.description}</td>
        <td className='open-article'>
          {article.processing_state === "Done" ?
            <div className='center-content' onClick={() => navigate(`/portal-reviewer/articles/${username}/${article.title}`)}>
              <FontAwesomeIcon icon={faPenClip} />
              <p>Evaluar</p>
            </div>
          : article.processing_state ==="Fail" ?
            <div className='center-content'>
              <FontAwesomeIcon icon={faCircleExclamation} />       
                <p>Fallido</p>
            </div>
            : 
            <div className='center-content'>
              <FontAwesomeIcon icon={faSpinner} />
              <p>Processing</p>
            </div>
          }
        </td>
      </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default ShowArticles;