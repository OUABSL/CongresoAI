import React, { useState, useEffect } from 'react';
import { Table, Container, Modal, Button, DropdownButton, Dropdown } from 'react-bootstrap';
import { redirect, useParams } from 'react-router-dom';
import { useContext } from "react";
import AuthContext from "../../context/context";

function ShowArticles() {
  const { username, sessionToken } = useContext(AuthContext); // Access username from context
  const [articles, setArticles] = useState([]);

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

  const handleDownloadZip = async (zipUrl, filename) => {
    try {
      const response = await fetch(`/api/v1${zipUrl}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error fetching Zip:', error);
    }
  };



  

  return (
    <Container className="my-5">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Título</th>
            <th>Descripción</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {articles.filter(article => article.description).map((article, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{article.title}</td>
        <td>{article.description}</td>
        <td><Button className='btn bg-secondary' href = {`/portal-reviewer/articles/${username}/${article.title}`}>Evaluar</Button></td>
        <td>
          <DropdownButton id="dropdown-button" title="Descargar">
            <Dropdown.Item onClick={() => handleDownloadPdf(article.pdf, article.title)}>Descargar PDF</Dropdown.Item>
            <Dropdown.Item onClick={() => handleDownloadZip(article.zip, article.title)}>Descargar ZIP</Dropdown.Item>
          </DropdownButton>
        </td>
      </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default ShowArticles;
