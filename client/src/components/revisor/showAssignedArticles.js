import React, { useState, useEffect } from 'react';
import { Table, Container, Alert, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useContext } from "react";
import AuthContext from "../../context/context";
import { AlertContext } from '../../context/alertProvider'; // Importa tu contexto
import { useTranslation } from 'react-i18next'; // Importa la función useTranslation

import '../estilos/show_articles.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenClip, faSpinner, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

function ShowAssignedArticles() {
  const { t } = useTranslation(); // Desestructuramos t para acceder a las funciones de traducción
  const { username, sessionToken, logout } = useContext(AuthContext); // Access username from context
  const { setAlert } = useContext(AlertContext)
  const [first, setFirst] = useState(false);
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(5);
  const requiredFields = ['title', 'description', 'submission_date', 'last_modified', 'submit_number', 'review_result', 'processing_state'];

  const navigate = useNavigate();

  useEffect(() => {
    document.title = `${t('showAssignedArticles.assignedArticles')} - ${username}`; // Usamos la traducción para el título de la página
  }, [username, t]);

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
      const response = await fetch(`/api/v1/evaluate/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }
      setArticles(data);
      setFirst(true);
    }
    fetchArticles()
  }, [username, sessionToken, logout]);

  if (!first) {
    return (
      <>
        <div className='d-flex justify-content-center align-items-center'>
          <FontAwesomeIcon icon={faSpinner} size='2x' />
        </div>
      </>
    );
  } else if (!articles.length) {
    return (
      <>
        <Container className="my-5 d-flex justify-content-center align-items-center">
          <Alert variant="warning">{t('showAssignedArticles.noArticlesAssigned')}</Alert> {/* Usamos la traducción */}
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
            <th>{t('showAssignedArticles.articleTitle')}</th> {/* Usamos la traducción */}
            <th>{t('showAssignedArticles.articleDescription')}</th> {/* Usamos la traducción */}
            <th>{t('showAssignedArticles.submissionDate')}</th> {/* Usamos la traducción */}
            <th>{t('showAssignedArticles.lastModified')}</th> {/* Usamos la traducción */}
            <th>{t('showAssignedArticles.submissionNumber')}</th> {/* Usamos la traducción */}
            <th>{t('showAssignedArticles.reviewStatus')}</th> {/* Usamos la traducción */}
            <th>{t('showAssignedArticles.accessArticle')}</th> {/* Usamos la traducción */}
          </tr>
        </thead>
        <tbody>
          {currentArticles.length > 0 && currentArticles.filter(article =>
            requiredFields.every(field => article.hasOwnProperty(field) && article[field])
          ).map((article, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{article.title}</td>
              <td>{article.description}</td>
              <td>{article.submission_date}</td>
              <td>{article.last_modified}</td>
              <td>{article.submit_number}</td>
              <td>{article.review_result}</td>
              <td className='open-article'>
                {article.processing_state === "Done" ?
                  <div className='center-content' onClick={() => navigate(`/portal-reviewer/articles/${username}/${article.title}`)}>
                    <FontAwesomeIcon icon={faPenClip} />
                    <p>{t('showAssignedArticles.evaluate')}</p> {/* Usamos la traducción */}
                  </div>
                  : article.processing_state === "Fail" ?
                    <div className='center-content' onClick={() => navigate(`/portal-reviewer/articles/${username}/${article.title}`)}>
                      <FontAwesomeIcon icon={faCircleExclamation} />
                      <p>{t('showAssignedArticles.failed')}</p> {/* Usamos la traducción */}
                    </div>
                    :
                    <div className='center-content' onClick={() => navigate(`/portal-reviewer/articles/${username}/${article.title}`)}>
                      <FontAwesomeIcon icon={faSpinner} />
                      <p>{t('showAssignedArticles.processing')}</p> {/* Usamos la traducción */}
                    </div>
                }
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

export default ShowAssignedArticles;
