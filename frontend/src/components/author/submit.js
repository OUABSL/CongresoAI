import React, { useState } from "react";
import { Card, Form, Button, Alert } from 'react-bootstrap';
import "../estilos/submit.css"
import { useContext } from "react";
import AuthContext from "../../context/context";

const SubmitArticle = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keyWords, setKeyWords] = useState("");
  const [file, setFile] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const { username, sessionToken } = useContext(AuthContext); // Accede a username y sessionToken desde el contexto



  const submitForm = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', username);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('key_words', keyWords);

    if (file) {
      formData.append('latex_project', file);
    }

    const requestOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer + ${sessionToken}`,
      },
      body: formData
    };

    try {
      const response = await fetch('http://localhost:5000/api/v1/submit', requestOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }
      else if (response.status === 201) {
        console.log(data.message);
        setAlert({ show: true, message: data.message, variant: 'success' });
      }
    } catch (error) {
      console.error(error.toString());
      setAlert({ show: true, message: error.toString(), variant: 'danger' });
    }
  };

  return (
    <Card className="submit-card mt-4 p-4 mx-auto">
      <Form onSubmit={submitForm} className="form-class">
        <h2>Rellene el formulario</h2>
        {alert.show && <Alert variant={alert.variant}>{alert.message}</Alert>}
        <Form.Group>
          <Form.Label className="label-class">Titulo del artículo</Form.Label>
          <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="input-class" />
        </Form.Group>

        <Form.Group>
          <Form.Label className="label-class">Descripción breve de su contenido</Form.Label>
          <Form.Control as="textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} required className="input-class" />
        </Form.Group>

        <Form.Group>
          <Form.Label className="label-class">Palabras clave</Form.Label>
          <Form.Control type="text" value={keyWords} onChange={(e) => setKeyWords(e.target.value)} required className="input-class" />
        </Form.Group>

        <Form.Group>
          <Form.Label className="label-class">Proyecto Latex</Form.Label>
          <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} required className="input-class" />
        </Form.Group>

        <Button variant="primary" type="submit" className="button-class">
          Submit
        </Button>
        </Form>
        </Card>
    );
};

export default SubmitArticle;