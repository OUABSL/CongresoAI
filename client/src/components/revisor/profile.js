import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Button , Form, Container, Row, Col} from 'react-bootstrap';
import { useParams, useNavigate} from 'react-router-dom';
import { useContext } from "react";
import { AlertContext } from '../../context/alertProvider';
import AuthContext from "../../context/context";
import { useAuth } from "../../context/appProvider";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import TagsInput from '../tagsInput';


function RevisorProfile() {
  const [profileData, setProfileData] = useState(null);
  const {username} = useParams();
  const {sessionToken, logout } = useContext(AuthContext); 
  const [editing, setEditing] = useState(false);
  const { setAlert } = useContext(AlertContext);
  const { setSessionToken, setRole} = useAuth();
  const navigate = useNavigate();
  const [knowledges, setKnowledges] = useState([]); 


  
  useEffect(() => {
    document.title = `Profil de revisor - ${username}`;
  }, [username]);

  useEffect(() => {
    const getProfile = async () => {
      const response = await fetch(
        `/api/v1/reviewers/profile/${username}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
          },
        }
      );

      if(response.status === 401) {
        logout();
      }
      const data = await response.json();

      setProfileData(data);
      setKnowledges(Array.isArray(data.knowledges) ? data.knowledges : []);

    };
    if (!editing) {
      getProfile();
    }
  }, [username, sessionToken, logout, editing]);

  const handleInputChange = (event) => {
    if (event.target.name === 'knowledges') {

      const tags = event.target.value.split(',').map(str => str.trim());
      setKnowledges(tags);
    } else {
      setProfileData({...profileData, [event.target.name]: event.target.value});
    }
  }
  const handleEditClick = () => {
    let newData = {...profileData};
    setProfileData(newData);
    setEditing(true);
  }

  const handleSaveClick = async () => {
    const response = await fetch(
      `/api/v1/reviewers/profile/${username}`,
      {
        method: 'PUT',
        body: JSON.stringify(profileData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
      }
    );

    if (response.ok) {
      setEditing(false);
      setAlert({ visible: true, variant: 'success', message: 'Perfil actualizado' });
    } else {
      setAlert({ visible: true, variant: 'danger', message: 'No se pudo actualizar el perfil. Intenta en otro momento!' });
    }
  }


  const handleChangeRole = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/v1/change-role', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ new_role: 'author' }),
    });

    if (response.ok) {
        const result = await response.json();
        setSessionToken(result.access_token);
        setRole("author");
        navigate(`/portal-author/profile/${username}`);
    } else {
        const errorMsg = await response.text();
        setAlert({
            show: true,
            message: errorMsg || "No se pudo cambiar el rol. Inténtelo de nuevo más tarde.",
            variant: "danger",
        });
    }
}

  if (!profileData) {
    return <div className="d-flex justify-content-center align-items-center"><FontAwesomeIcon icon={faSpinner} size='2x'></FontAwesomeIcon></div>;
  }
  return (
    <Container className="d-flex justify-content-center align-items-center h-100">
      <Card style={{ width: '25rem' }} className="p-3 mt-5">
          <Card.Body>
            <Card.Title>
                Nombre completo:
                {editing ? 
                        <Form.Control readOnly={!editing} type="text" name="fullname" value={profileData.fullname || ''} onChange={handleInputChange}/> :
                        `${profileData.fullname}`
                }
            </Card.Title>
            <Card.Subtitle className="mb-1 p-1 text-muted">
                Usuario: 
                {editing ? 
                    <Form.Control readOnly style={{backgroundColor:'#f1f1f1', border: '1px solid #888'}} plaintext value={profileData.username} /> :
                    `${profileData.username}`
                }
            </Card.Subtitle>
            <Card.Subtitle className="mb-2 p-1 text-muted">
              { editing ?
            <Form.Control readOnly style={{backgroundColor:'#f1f1f1', border: '1px solid #888'}} plaintext value={profileData.ORCID} /> :
                `${profileData.ORCID}`
              }
            </Card.Subtitle>
            <ListGroup variant="flush">
              <ListGroup.Item className="p-2">
                Email:
                {editing ? 
                    <Form.Control readOnly={!editing} type="email" name="email" value={profileData.email || ''} onChange={handleInputChange}/> :
                    ` ${profileData.email}`
                }
              </ListGroup.Item>
              <ListGroup.Item className="p-2">
                Número de teléfono:
                {editing ? 
                    <Form.Control readOnly={!editing} type="tel" name="phonenumber" value={profileData.phonenumber || ''} onChange={handleInputChange}/> :
                    ` ${profileData.phonenumber}`
                }
              </ListGroup.Item>
              <ListGroup.Item className="p-2">
                Conocimientos:
                {editing ? 
                  <TagsInput
                    tags={knowledges}
                    setTags={setKnowledges}
                  /> :
                  ` ${knowledges.join(', ')}`
                }
              </ListGroup.Item>
              <ListGroup.Item className="p-2">
                Fecha de registro:
                    {editing ? 
                    <Form.Control readOnly style={{backgroundColor:'#f1f1f1', border: '1px solid #888'}} plaintext value={profileData.registration_date} /> :
                    ` ${profileData.registration_date}`
                  }
              </ListGroup.Item>
          </ListGroup>
          <Form.Group as={Row} className="justify-content-around my-3 p-2">
            <Col sm="auto">
                <Button variant="primary" onClick={editing ? handleSaveClick : handleEditClick}>
                    {editing ? 'Guardar' : 'Editar perfil'}
                </Button>
            </Col>
            {profileData.is_bi && !editing && (
                <Col sm="auto">
                    <Button variant="secondary" onClick={handleChangeRole}>Pasar a autor</Button>
                </Col>
            )}
          </Form.Group>
        </Card.Body>
      </Card>
    </Container>
);
}
export default RevisorProfile;