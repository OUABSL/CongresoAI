import React, { useEffect, useState, useContext } from "react";
import { Card, Form, Button, Alert } from 'react-bootstrap';
import "../estilos/submit.css"
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SubmitSummary from './submitSummary';
import AuthContext from "../../context/context";
import { AlertContext } from '../../context/alertProvider';


const SubmitArticle = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keyWords, setKeyWords] = useState("");
  const [file, setFile] = useState(null);
  const { alert, setAlert } = useContext(AlertContext);
  const { username, sessionToken, logout } = useContext(AuthContext); // Accede a username y sessionToken desde el contexto
  const { state } = useLocation();
  const [reviewComments, setReviewComments] = useState([]);
  const [improvements, setImprovements] = useState("");
  const [isResubmit, setIsResubmit] = useState(false);
  const [article, setArticle] = useState({});
  const [submitSummary, setSubmitSummary] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    if(state && state.isResubmit){
      console.log(`Estado:\n${state.article}\n${state.comments}`);
      setIsResubmit(true);
      setArticle(state.article)
      if(state.comments){
        const commentsList = Object.entries(state.comments).reduce((acc, [sectionName, sectionComments]) => {
          return acc.concat(`${sectionName}: \n- ${sectionComments}\n`);
        }, []);
        if(article && article.title && article.key_words && article.description && commentsList){
          setTitle(article.title);
          setKeyWords(article.key_words);
          setDescription(article.description);
          setReviewComments(commentsList);
        }
        
      }
    }
  }, [state, article]);

  const submitForm = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', username);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('key_words', keyWords);
    if (isResubmit){
      formData.append('improvements', improvements);
      formData.append('review_comments', reviewComments);
      formData.append('resubmit', true);
    }

    if (file) {
      formData.append('latex_project', file);
    }

    const requestOptions = {
      method: state && isResubmit ? 'PUT' : 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: formData
    };

    const api = state && isResubmit ? `/api/v1/submit/${username}/${title}`: `/api/v1/submit`;
    try {
      console.log("Making request to:", api);
      console.log("Request options:", requestOptions);
  
      const response = await fetch(api, requestOptions);
      console.log("Response:", response);
  
      const data = await response.json();
      console.log("Response data:", data);
  
      if (!response.ok) {
        if(response.status === 401) {
          logout();
          return;
        }
        throw new Error(data.message);
      }
      else if (response.status === 201 || response.status === 200) {
        setAlert({ show: true, message: data.message, variant: 'success' });  
        const url = URL.createObjectURL(file);
        setSubmitSummary(data.submit_summary);
        // Navega después de establecer el estado
        navigate('/portal-author/submit-summary', { 
          state: { 
            submitSummary: data.submit_summary, 
            latex_project_url: url
           } 
          });
          
        setTitle("");
        setDescription("");
        setKeyWords("");
        setFile(null);
      }
    } catch (error) {
      console.error(error);
      setAlert({ show: true, message: error.toString(), variant: 'danger' });
    }
  };

  return (
    <Card className="submit-card mt-4 p-4 mx-auto">
      <Form onSubmit={submitForm} className="form-class">
        <h2>Rellene el formulario</h2>
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

        {isResubmit && 
    <>
      <Form.Group>
        <Form.Label>Comentarios del Revisor</Form.Label>
        <Form.Control 
          as="textarea" 
          style={{height: "100%"}} 
          readOnly 
          value={reviewComments.join('\n')} 
          rows={reviewComments.length} 
        />
      </Form.Group>
      <Form.Group> 
        <Form.Label className="label-class">Descripción de realizadas mejoras</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={2} 
          value={improvements} 
          onChange={(e) => setImprovements(e.target.value)} 
          required 
          className="input-class" 
        />
      </Form.Group>
    </>
    }

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