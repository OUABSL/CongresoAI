import React, { useEffect, useState } from 'react';
import { Card, Button , Form, Container, Row, Col} from 'react-bootstrap';
import { useParams, useNavigate} from 'react-router-dom';
import { useContext } from "react";
import { AlertContext } from '../../context/alertProvider';
import AuthContext from "../../context/context";
import { useAuth } from "../../context/appProvider";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import TagsInput from '../tagsInput';
import { useTranslation } from 'react-i18next';

import "../estilos/profile.css";




function RevisorProfile() {
  const [profileData, setProfileData] = useState(null);
  const {username} = useParams();
  const {sessionToken, logout } = useContext(AuthContext); 
  const [editing, setEditing] = useState(false);
  const { setAlert } = useContext(AlertContext);
  const { setSessionToken, setRole} = useAuth();
  const navigate = useNavigate();
  const [knowledges, setKnowledges] = useState([]); 
  const { t } = useTranslation(); 


  
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
      const result = await response.json();

      if(response.status === 401) {
        logout();
      }

      setProfileData(result);
      setKnowledges(Array.isArray(result.knowledges) ? result.knowledges : []);

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

  const handleEditCancel = () => {
    setEditing(false);
  }

  const handleSaveClick = async () => {
    const updatedProfileData = { ...profileData, knowledges:knowledges };
    const response = await fetch(
      `/api/v1/reviewers/profile/${username}`,
      {
        method: 'PUT',
        body: JSON.stringify(updatedProfileData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
      }
    );

    const result = await response.json();

    if (result.success) {
      setEditing(false);
      setAlert({ show: true, message: 'Perfil actualizado', variant: 'success' });
    } else {
      setAlert({ show: true, message: 'No se pudo actualizar el perfil. Intenta en otro momento!', variant: 'danger'});
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

    const result = await response.json();

    if (result.success) {
        setSessionToken(result.access_token);
        setRole("author");
        navigate(`/portal-author/profile/${username}`);
    } else {
        const errorMsg = await result.text() || '';
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
      <Card className="p-3 mt-5 shadow-lg profile-card">
        <Card.Body>
          <h2 className="text-center mb-4">
            {t('reviewerProfile.title')} - <b>{profileData.username || '-'}</b>
          </h2>
          <Form>
            <Row className="mb-3">
              <Col sm={6}>
                <Form.Group as={Row} className="field-box">
                  <Form.Label column sm={4}>{t('reviewerProfile.name')}:</Form.Label>
                  <Col sm={8} className="p-0">
                    {editing ? (
                      <Form.Control
                        type="text"
                        name="fullname"
                        value={profileData.fullname || ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div>{profileData.fullname || '-'}</div>
                    )}
                  </Col>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group as={Row} className={`field-box ${editing ? 'onlyread-field' : ''}`}>
                  <Form.Label column sm={4}>{t('reviewerProfile.orcid')}:</Form.Label>
                  <Col sm={8} className="p-0">
                    {editing ? (
                      <Form.Control
                        className="ps-1"
                        readOnly
                        plaintext
                        value={profileData.ORCID}
                      />
                    ) : (
                      <div>{profileData.ORCID || '-'}</div>
                    )}
                  </Col>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col sm={6}>
                <Form.Group as={Row} className="field-box">
                  <Form.Label column sm={4}>{t('reviewerProfile.email')}:</Form.Label>
                  <Col sm={8} className="p-0">
                    {editing ? (
                      <Form.Control
                        type="email"
                        name="email"
                        value={profileData.email || ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div>{profileData.email || '-'}</div>
                    )}
                  </Col>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group as={Row} className="field-box">
                  <Form.Label column sm={4}>{t('reviewerProfile.phone')}:</Form.Label>
                  <Col sm={8} className="p-0">
                    {editing ? (
                      <Form.Control
                        type="tel"
                        name="phonenumber"
                        value={profileData.phonenumber || ''}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div>{profileData.phonenumber || '-'}</div>
                    )}
                  </Col>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group as={Row} className="field-box">
                  <Form.Label column sm={4}>{t('reviewerProfile.knowledgeAreas')}:</Form.Label>
                  <Col sm={8} className="p-0">
                    {editing ? (
                      <TagsInput
                        tags={knowledges}
                        setTags={setKnowledges}
                        persPlaceholder={t('reviewerProfile.knowledgePlaceholder')}
                      />
                    ) : (
                      <div>{knowledges.length > 0 ? knowledges.join(', ') : '-'}</div>
                    )}
                  </Col>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group as={Row} className={`field-box ${editing ? 'onlyread-field' : ''}`}>
                  <Form.Label column sm={4}>{t('reviewerProfile.registrationDate')}:</Form.Label>
                  <Col sm={8} className="p-0">
                    {editing ? (
                      <Form.Control
                        className="ps-1"
                        readOnly
                        plaintext
                        value={profileData.registration_date}
                      />
                    ) : (
                      <div>{profileData.registration_date || '-'}</div>
                    )}
                  </Col>
                </Form.Group>
              </Col>
            </Row>
            <Row className="justify-content-between">
              <Col sm="auto">
                <Button
                  variant="primary"
                  onClick={editing ? handleSaveClick : handleEditClick}
                >
                  {editing ? t('reviewerProfile.save') : t('reviewerProfile.editProfile')}
                </Button>
              </Col>
              {editing && (
                <Col sm="auto">
                  <Button
                    variant="secondary"
                    onClick={handleEditCancel}
                  >
                    {t('reviewerProfile.cancelButton')}
                  </Button>
                </Col>
              )}
              {profileData.is_bi && !editing && (
                <Col sm="auto">
                  <Button
                    variant="secondary"
                    onClick={handleChangeRole}
                  >
                    {t('reviewerProfile.switchToAuthor')}
                  </Button>
                </Col>
              )}
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
  
};
  
export default RevisorProfile;