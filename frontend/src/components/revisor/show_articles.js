import React, { useState, useEffect } from 'react';
import { Table, Container, Modal, Button, DropdownButton, Dropdown } from 'react-bootstrap';
import { redirect, useParams } from 'react-router-dom';
import { useContext } from "react";
import AuthContext from "../../context/context";

function ShowArticles() {
  const { username, sessionToken, logout } = useContext(AuthContext); // Access username from context
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

      if(response.status === 401) {
        logout();
        return;
      }


      const data = await response.json();
      setArticles(data);
    }
    fetchArticles()
  }, [username, sessionToken])


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
        <td><Button className='btn bg-secondary' href = {`/portal-reviewer/articles/${username}/${article.title}`}>Evaluar</Button></td>
      </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default ShowArticles;
