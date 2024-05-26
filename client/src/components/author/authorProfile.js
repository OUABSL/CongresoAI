import React, { useEffect, useState } from 'react';
import { Card, Button , Form, Container, Col, Row} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useContext } from "react";
import { AlertContext } from '../../context/alertProvider';
import AuthContext from "../../context/context";
import { useAuth } from "../../context/appProvider";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import TagsInput from '../tagsInput';
import "../estilos/profile.css";


function AuthorProfile() {
  const [profileData, setProfileData] = useState(null);
  const {username} = useParams();
  const {sessionToken, logout } = useContext(AuthContext); 
  const [editing, setEditing] = useState(false);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  const { setSessionToken, setRole } = useAuth();
  const [intereses, setIntereses] = useState([]);



  useEffect(() => {
    document.title = `Profil de autor - ${username}`;
  }, [username]);
  
  useEffect(() => {
    const getProfile = async () => {
      const response = await fetch(
        `/api/v1/authors/profile/${username}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
          },
        }
      );

      const result = await response.json();

      if(response.status === 401) {
        logout();
      }
      setProfileData(result);
      setIntereses(Array.isArray(result.interests) ? result.interests : []);

    };
    if (!editing) {
      getProfile();
    }
  }, [username, sessionToken, logout, editing]);

  const handleInputChange = (event) => {
    setProfileData({...profileData, [event.target.name]: event.target.value});
  }

  const handleEditClick = () => {
    setEditing(true);
  }

  const handleEditCancel = () => {
    setEditing(false);
  }

  
  const handleChangeRole = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/v1/change-role', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ new_role: 'reviewer' }),
    });
    const result = await response.json();

    if (result.success) {
        setSessionToken(result.access_token);
        setRole("reviewer");
        navigate(`/portal-reviewer/profile/${username}`);
    } else {
        const errorMsg = await response.text();
        setAlert({
            show: true,
            message: errorMsg || "No se pudo cambiar el rol. Inténtelo de nuevo más tarde.",
            variant: "danger",
        });
    }
}

  const handleSaveClick = async () => {
    const response = await fetch(
      `/api/v1/authors/profile/${username}`,
      {
        method: 'PUT',
        body: JSON.stringify(profileData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
      }
    );
    const result = await response.json();


    if (result.success) {
      setEditing(false);
      setAlert({ show: true, variant: 'success', message: 'Perfil actualizado' });
    } else {
      setAlert({ show: true, variant: 'danger', message: 'No se pudo actualizar el perfil. Intenta en otro momento!' });
    }
  }

 if (!profileData) {
    return <div className="d-flex justify-content-center align-items-center"><FontAwesomeIcon icon={faSpinner} scale="2x"></FontAwesomeIcon></div>;
  }

  return (
    <Container className="d-flex justify-content-center align-items-center h-100">
      <Card className="profile-card p-3 mt-5 shadow-lg">
        <Card.Body>
          <h2 className="text-center mb-4">Perfil de autor - <b>{profileData.username || '-'}</b></h2>
          <Form>
            <Row className="mb-3">
              <Col sm={6}>
                 <Form.Group as={Row} className='field-box'>
                  <Form.Label column sm={4}>Nombre:</Form.Label>
                  <Col sm={8} className='p-0'>
                      {editing ? 
                          <Form.Control type="text" name="fullname" value={profileData.fullname || ''} onChange={handleInputChange}/> :
                          <div >{profileData.fullname || '-'}</div>
                      }
                  </Col>
                </Form.Group>
              </Col>
              <Col sm={6}>
                   <Form.Group as={Row} className='field-box onlyread-field'>
                    <Form.Label column sm={4}>Usuario:</Form.Label>
                    <Col sm={8} className='p-0'>
                        {editing ?
                            <Form.Control className='ps-1' readOnly plaintext value={profileData.username} /> :
                            <div >{profileData.username || '-'}</div>
                        }
                    </Col>
                  </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col sm={6}>
                   <Form.Group as={Row} className='field-box'>
                    <Form.Label column sm={4}>Email:</Form.Label>
                    <Col sm={8} className='p-0'>
                        {editing ? 
                            <Form.Control type="email" name="email" value={profileData.email || ''} onChange={handleInputChange}/> :
                            <div >{profileData.email || '-'}</div>
                        }
                    </Col>
                  </Form.Group>
              </Col>
              <Col sm={6}>
                   <Form.Group as={Row} className='field-box'>
                      <Form.Label column sm={4}>Teléfono:</Form.Label>
                      <Col sm={8} className='p-0'>
                          {editing ? 
                              <Form.Control type="tel" name="phonenumber" value={profileData.phonenumber || ''} onChange={handleInputChange}/> :
                              <div >{profileData.phonenumber || '-'}</div>
                          }
                      </Col>
                  </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group as={Row} className='field-box'>
                    <Form.Label column sm={4}>Intereses:</Form.Label>
                    <Col sm={8} className='p-0'>
                    {editing ? 
                        <TagsInput tags={intereses} setTags={setIntereses} persPlaceholder="áreas de intéres" /> :
                        <div >{intereses.length > 0 ? intereses.join(', ') : '-'}</div>
                    }
                    </Col>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group as={Row} className='field-box onlyread-field'>
                  <Form.Label column sm={4}>Fecha de registro:</Form.Label>
                  <Col sm={8} className='p-0'>
                      {editing ?
                          <Form.Control className='ps-1' readOnly plaintext value={profileData.registration_date} /> :
                          <div >{profileData.registration_date || '-'}</div>
                      }
                  </Col>
                </Form.Group>
              </Col>
            </Row>
            <Row className="justify-content-between">
              <Col sm="auto">
                  <Button variant="primary" onClick={editing ? handleSaveClick : handleEditClick}>
                  {editing ? 'Guardar' : 'Editar perfil'}
                  </Button>
              </Col>
              {editing && (
                  <Col sm="auto">
                  <Button variant="secondary" onClick={handleEditCancel}>Cancelar</Button>
                  </Col>
              )}
              {profileData.is_bi && !editing && (
                  <Col sm="auto">
                  <Button variant="secondary" onClick={handleChangeRole}>Pasar a revisor</Button>
                  </Col>
              )}
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
    );
  }
  

export default AuthorProfile;


/* 
return (
    <>
    <Container className="d-flex justify-content-center align-items-center h-100">
      <Card style={{ width: '30rem' }} className="p-3 mt-5">
          <Card.Body>
              <Card.Title>
                  Nombre completo:
                  {editing ? 
                           <Form.Control readOnly={!editing} type="text" name="fullname" value={profileData.fullname || ''} onChange={handleInputChange}/> :
                          ` ${profileData.fullname}`
                  }
              </Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                  Usuario:
                  {editing ?
                        <Form.Control className='ps-1' readOnly style={{backgroundColor:'#f1f1f1', border: '1px solid #888'}} plaintext value={profileData.username} /> :
                          ` ${profileData.username}`
                    }
              </Card.Subtitle>

            <ListGroup.Item className="p-2">
              Email:
                {editing ? 
                  <Form.Control readOnly={!editing} type="email" name="email" value={profileData.email || ''} onChange={handleInputChange}/> :
                  ` ${profileData.email}`
                }
              </ListGroup.Item>
          <ListGroup variant="flush">
              <ListGroup.Item className="p-2">
                  Número de teléfono:
                  {editing ? 
                      <Form.Control readOnly={!editing} type="tel" name="phonenumber" value={profileData.phonenumber || ''} onChange={handleInputChange}/> :
                      ` ${profileData.phonenumber}`
                  }
              </ListGroup.Item>
              <ListGroup.Item className="p-2">
                Lista de intereses:
                {editing ? 
                  <TagsInput
                    tags={intereses}
                    setTags={setIntereses}
                    persPlaceholder="áreas de intéres"
                  /> :
                  ` ${intereses.length > 0 ? intereses.join(', ') : '-'}`
                }
              </ListGroup.Item>
              <ListGroup.Item className="p-2">
              Fecha de registro:
                  {editing ?
                  <Form.Control  className='ps-1' readOnly style={{backgroundColor:'#f1f1f1', border: '1px solid #888'}} plaintext value={profileData.registration_date} /> : 
                  ` ${profileData.registration_date}`}
                  </ListGroup.Item>
          </ListGroup>
          <Form.Group as={Row} className="justify-content-around p-2 my-3">
            <Col sm="auto">
                <Button variant="primary" onClick={editing ? handleSaveClick : handleEditClick}>
                    {editing ? 'Guardar' : 'Editar perfil'}
                </Button>
            </Col>
            {editing && (<Col sm="auto">
                <Button variant="primary" onClick={handleEditCancel}>Cancelar</Button>
            </Col>)}
            {profileData.is_bi && !editing && (
                <Col sm="auto">
                    <Button variant="secondary" onClick={handleChangeRole}>Pasar a revisor</Button>
                </Col>
            )}
        </Form.Group>
        </Card.Body>
      </Card>
    </Container>
    </>
  );
}



*/