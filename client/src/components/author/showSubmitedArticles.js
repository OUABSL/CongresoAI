import React, { useState, useEffect } from 'react';
import { Table, Container, Alert} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useContext } from "react";
import AuthContext from "../../context/context";
import { AlertContext } from '../../context/alertProvider';

import '../estilos/show_articles.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faEye} from '@fortawesome/free-solid-svg-icons';

function ShowSubmittedArticles() {
  const { username, sessionToken, logout } = useContext(AuthContext);
  const {setAlert} = useContext(AlertContext)

  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      const response = await fetch(`/api/v1/submit/${username}`,
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
      if (Array.isArray(data)) {
        setArticles(data);
      } else {
        console.error('API did not return an array');
      }
    }
    fetchArticles()
  }, [username, sessionToken, logout])

  if (!articles.length) {
    return <Alert variant="warning">No hay ningún artículo presentado</Alert>;
  }

  return (
    <Container className="my-5">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Título</th>
            <th>Estado de revisión</th>
            <th>Fecha de Presentación</th>
            <th>Última modificación</th>
            <th>Ver artículo</th>
          </tr>
        </thead>
        <tbody>
        {articles.filter(article => article.description).map((article, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{article.title}</td>
            <td>{article.review_result}</td>
            <td>{article.submission_date}</td>
            <td>{article.last_modified}</td>
            <td className='open-article'>
            <div className='center-content' onClick={() => navigate(`/portal-author/articles/${username}/${article.title}`)}>
              <FontAwesomeIcon icon={faEye} />
              <p>Ver artículo</p>
            </div>
            </td>
          </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default ShowSubmittedArticles;