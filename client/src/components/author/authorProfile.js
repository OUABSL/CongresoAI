import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Button , Form, Container, Col, Row} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useContext } from "react";
import { AlertContext } from '../../context/alertProvider';
import AuthContext from "../../context/context";
import { useAuth } from "../../context/appProvider";


function AuthorProfile() {
  const [profileData, setProfileData] = useState(null);
  const {username} = useParams();
  const {sessionToken, logout } = useContext(AuthContext); 
  const [editing, setEditing] = useState(false);
  const { alert, setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  const { setSessionToken, setRole } = useAuth();


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

      if(response.status === 401) {
        logout();
      }
      const data = await response.json();

      setProfileData(data);
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

    if (response.ok) {
        const result = await response.json();
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

    if (response.ok) {
      setEditing(false);
      setAlert({ visible: true, variant: 'success', message: 'Perfil actualizado' });
    } else {
      setAlert({ visible: true, variant: 'danger', message: 'No se pudo actualizar el perfil. Intenta en otro momento!' });
    }
    setTimeout(()=> setAlert({visible: false, variant: '', message: ''}), 1000)
  }

 if (!profileData) {
    return <div>El perfil está Cargando...</div>;
  }
  return (
    <>
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
              <Card.Subtitle className="mb-2 text-muted">
                  Usuario:
                  {editing ?
                        <Form.Control readOnly style={{backgroundColor:'#f1f1f1', border: '1px solid #888'}} plaintext value={profileData.username} /> :
                          `${profileData.username}`
                    }
              </Card.Subtitle>
              <Card.Text>
                  Email:
                  {editing ? 
                      <Form.Control readOnly={!editing} type="email" name="email" value={profileData.email || ''} onChange={handleInputChange}/> :
                      ` ${profileData.email}`
                  }
              </Card.Text>
          </Card.Body>
          <ListGroup variant="flush">
              <ListGroup.Item>
                  Número de teléfono:
                  {editing ? 
                      <Form.Control readOnly={!editing} type="tel" name="phonenumber" value={profileData.phonenumber || ''} onChange={handleInputChange}/> :
                      ` ${profileData.phonenumber}`
                  }
              </ListGroup.Item>
              <ListGroup.Item>
              Fecha de registro:
                  {editing ?
                  <Form.Control readOnly style={{backgroundColor:'#f1f1f1', border: '1px solid #888'}} plaintext value={profileData.registration_date} /> : 
                  ` ${profileData.registration_date}`}
                  </ListGroup.Item>
          </ListGroup>
          <Form.Group as={Row} className="justify-content-around my-3">
            <Col sm="auto">
                <Button variant="primary" onClick={editing ? handleSaveClick : handleEditClick}>
                    {editing ? 'Guardar' : 'Editar perfil'}
                </Button>
            </Col>
            {profileData.is_bi && (
                <Col sm="auto">
                    <Button variant="secondary" onClick={handleChangeRole}>Pasar a revisor</Button>
                </Col>
            )}
        </Form.Group>
      </Card>
    </Container>
    </>
  );
}

export default AuthorProfile;