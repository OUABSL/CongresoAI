import React, { useState, useEffect } from 'react';
import { Table, Container, Modal, Button } from 'react-bootstrap';
import PDFViewer from '../view_pdf';
import { redirect, useParams } from 'react-router-dom';
import { useContext } from "react";
import AuthContext from "../../context/context";

function ShowArticles() {
  const { username, sessionToken } = useContext(AuthContext); // Access username from context
  const [articles, setArticles] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
      const data = await response.json();
      setArticles(data);
    }
    fetchArticles()
  }, [username, sessionToken])

  const handleShowPdf = async (pdfUrl) => {
    try {
      const response = await fetch(`/api/v1${pdfUrl}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const blob = await response.blob();
      const pdf = window.URL.createObjectURL(blob);
      setSelectedPdf(pdf);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching PDF:', error);
    }
  };

  const handleDownloadPdf = async (pdfUrl, filename) => {
    try {
      const response = await fetch(`/api/v1${pdfUrl}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.pdf`); // asume que filename es el nombre del archivo sin la extensión
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error fetching PDF:', error);
    }
  };


  

  return (
    <Container className="my-5">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>PDF Link</th>
            <th>Download</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{article.title}</td>
              <td><button onClick={() => handleShowPdf(article.pdf)}>Visualizar Artículo</button></td>
              <td><Button onClick={() => handleDownloadPdf(article.pdf)}>Descargar PDF</Button></td>
              <td><Button href = {`/portal-reviewer/articles/${username}/${article.title}`}>Evaluar Artículo</Button></td>

            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Body>
          <PDFViewer file={selectedPdf} />
        </Modal.Body>
      </Modal>
    </Container>
  )
}

export default ShowArticles;