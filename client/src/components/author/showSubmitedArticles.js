import React, { useState, useEffect, useContext } from 'react';
import { Table, Container, Alert, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthContext from "../../context/context";
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const ShowSubmittedArticles = () => {
  const { username, sessionToken, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(5);
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('showSubmittedArticles.revisionResult');
  }, [t]);

  useEffect(() => {
    const fetchArticles = async () => {
      const response = await fetch(`/api/v1/submit/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setArticles(data);
      } else {
        console.error('API did not return an array');
      }
    };

    fetchArticles();
  }, [username, sessionToken, logout]);

  if (!articles.length) {
    return (
      <Container className="my-5 d-flex justify-content-center align-items-center">
        <Alert variant="warning">{t('showSubmittedArticles.noArticles')}</Alert>
      </Container>
    );
  }

  const indexOfLastPost = currentPage * articlesPerPage;
  const indexOfFirstPost = indexOfLastPost - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <Container className="my-5">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>{t('showSubmittedArticles.columns.number')}</th>
            <th>{t('showSubmittedArticles.columns.title')}</th>
            <th>{t('showSubmittedArticles.columns.submissionID')}</th>
            <th>{t('showSubmittedArticles.columns.reviewStatus')}</th>
            <th>{t('showSubmittedArticles.columns.submissionDate')}</th>
            <th>{t('showSubmittedArticles.columns.submissionNumber')}</th>
            <th>{t('showSubmittedArticles.columns.viewArticle')}</th>
          </tr>
        </thead>
        <tbody>
          {currentArticles.map((article, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{article.title}</td>
              <td>{article.submission_id}</td>
              <td>{article.review_result}</td>
              <td>{article.submission_date}</td>
              <td>{article.submit_number}</td>
              <td>
                {article.review_result !== "Pending Review" ? (
                  <div onClick={() => navigate(`/portal-author/articles/${username}/${article.title}`)}>
                    <FontAwesomeIcon icon={faEye} />
                  </div>
                ) : (
                  <FontAwesomeIcon icon={faEyeSlash} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination className="justify-content-center">
        {Array.from({ length: Math.ceil(articles.length / articlesPerPage) }, (_, i) => (
          <Pagination.Item
            key={i + 1}
            active={i + 1 === currentPage}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </Container>
  );
};

export default ShowSubmittedArticles;
