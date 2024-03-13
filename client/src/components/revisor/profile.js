import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Alert, Button , Form} from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useContext } from "react";

import AuthContext from "../../context/context";

function RevisorProfile() {
  const [profileData, setProfileData] = useState(null);
  const {username} = useParams();
  const {sessionToken, logout } = useContext(AuthContext); 
  const [editing, setEditing] = useState(false);
  const [alert, setAlert] = useState({visible: false, variant: '', message: ''});
  const formatDate = (date) => {
    let birthdate = new Date(date);
    let month = '' + (birthdate.getMonth() + 1),
        day = '' + birthdate.getDate(),
        year = birthdate.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    const formattedBirthdate = [year, month, day].join('-');
    return formattedBirthdate;
  }
  

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
    };
    if (!editing) {
      getProfile();
    }
  }, [username, sessionToken, logout, editing]);

  const handleInputChange = (event) => {
    setProfileData({...profileData, [event.target.name]: event.target.value});
  }

  const handleEditClick = () => {
    let newData = {...profileData};
    newData.birthdate = formatDate(newData.birthdate);
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
    setTimeout(()=> setAlert({visible: false, variant: '', message: ''}), 1000)
  }

  if (!profileData) {
    return <div>El perfil está Cargando...</div>;
  }
  return (
    <>
    {alert.visible && <Alert variant={alert.variant}>{alert.message}</Alert>}
    <Card style={{ width: '25rem' }} className="mt-5">
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
                    `${profileData.email}`
                }
            </Card.Text>
        </Card.Body>
        <ListGroup variant="flush">
        <ListGroup.Item>
          Fecha de nacimiento:
          {editing ? 
            <Form.Control readOnly={!editing} type="date" name="birthdate" value={profileData.birthdate || ''} onChange={handleInputChange}/> :
            ` ${profileData.birthdate}`
          }
        </ListGroup.Item>
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
                <Form.Control readOnly style={{backgroundColor:'#f1f1f1', border: '1px solid #888'}} plaintext value={profileData.registration_date} />
                 : 
                ` ${profileData.registration_date}`
            }
              
            </ListGroup.Item>
            <ListGroup.Item>
                Conocimientos: {profileData.knowledges}
            </ListGroup.Item>
        </ListGroup>
        <Button variant="primary" onClick={editing ? handleSaveClick : handleEditClick}>
            {editing ? 'Guardar' : 'Editar perfil'}
        </Button>
    </Card>
    </>
  );
}

export default RevisorProfile;