import React, { useState, useEffect } from 'react';
import { Table, Container, Alert, Pagination} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useContext } from "react";
import AuthContext from "../../context/context";
import { AlertContext } from '../../context/alertProvider';
import '../estilos/show_articles.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';

function ShowSubmittedArticles() {
  const { username, sessionToken, logout } = useContext(AuthContext);
  const {setAlert} = useContext(AlertContext)
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(5);
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();
  const requiredFields = ['title', 'submission_id', 'review_result', 'submission_date', 'submit_number'];



  useEffect(() => {
    document.title = `Resultado de Revisión`;
  }, []);


  const indexOfLastPost = currentPage * articlesPerPage;
  const indexOfFirstPost = indexOfLastPost - articlesPerPage;
  const currentArticles = Array.isArray(articles) && articles.length > 0 ? articles.slice(indexOfFirstPost, indexOfLastPost) : [];


  const paginate = (currentPage) => setCurrentPage(currentPage);
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(articles.length / articlesPerPage); i++) {
    pageNumbers.push(i);
  }
  
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
      const data = await response.json();


      if(response.status === 401) {
        logout();
        return;
      }
      if (Array.isArray(data)) {
        setArticles(data);
      } else {
        console.error('API did not return an array');
      }
    }
    fetchArticles()
  }, [username, sessionToken, logout])

  if (!articles.length) {
    return (
      <>
      <Container className="my-5 d-flex justify-content-center align-items-center">
        <Alert variant="warning">No existe ningún artículo asignado</Alert>
      </Container>
    </>
    );
  }

  return (
    <Container className="my-5">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Título</th>            
            <th>ID de entrega</th>
            <th>Estado de revisión</th>
            <th>Fecha de presentación</th>
            <th>Número de entrega</th>
            <th>Ver artículo</th>
          </tr>
        </thead>
        <tbody>
        {currentArticles.length > 0 && currentArticles
        .filter(article =>requiredFields.every(field => article.hasOwnProperty(field) && article[field]))
        .map((article, index) => (
            <tr key={index}>
            <td>{index + 1}</td>
            <td>{article.title}</td>
            <td>{article.submission_id}</td>
            <td>{article.review_result}</td>
            <td>{article.submission_date}</td>
            <td>{article.submit_number}</td>
            <td className='open-article'>
                {article.review_result !== "Pending Review" ? (
                  <div className='center-content' onClick={() => navigate(`/portal-author/articles/${username}/${article.title}`)}>
                    <FontAwesomeIcon icon={faEye} />
                  </div>
                ) : (
                  <div className='center-content'>
                    <FontAwesomeIcon icon={faEyeSlash} />
                  </div>
                )}
              </td>
          </tr>
          ))}
        </tbody>
      </Table>
      <Pagination className='justify-content-center'>
        {pageNumbers.map(num => (
          <Pagination.Item key={num} active={num === currentPage} onClick={() => paginate(num)}>
            {num}
          </Pagination.Item>
          ))}
      </Pagination>
    </Container>
  );
}

export default ShowSubmittedArticles;