import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Container, Col, Row } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useContext } from "react";
import { AlertContext } from '../../context/alertProvider';
import AuthContext from "../../context/context";
import { useAuth } from "../../context/appProvider";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import TagsInput from '../tagsInput';
import { useTranslation } from 'react-i18next';
import "../estilos/profile.css";

function AuthorProfile() {
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState(null);
  const { username } = useParams();
  const { sessionToken, logout } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  const { setSessionToken, setRole } = useAuth();
  const [intereses, setIntereses] = useState([]);

  useEffect(() => {
    document.title = t('authorProfile.title', { username });
  }, [username, t]);

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

      if (response.status === 401) {
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
    setProfileData({ ...profileData, [event.target.name]: event.target.value });
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleEditCancel = () => {
    setEditing(false);
  };

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
      setAlert({
        show: true,
        message: result.message || t('authorProfile.changingRoleError'),
        variant: "danger",
      });
    }
  };

  const handleSaveClick = async () => {
    const updatedProfileData = { ...profileData, interests: intereses };
    const response = await fetch(
      `/api/v1/authors/profile/${username}`,
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
      setAlert({ show: true, variant: 'success', message: t('authorProfile.updatingProfileSuccess') });
    } else {
      setAlert({ show: true, variant: 'danger', message: t('authorProfile.updatingProfileError') });
    }
  };

  if (!profileData) {
    return <div className="d-flex justify-content-center align-items-center"><FontAwesomeIcon icon={faSpinner} scale="2x"></FontAwesomeIcon></div>;
  }

  return (
    <Container className="d-flex justify-content-center align-items-center h-100">
      <Card className="profile-card p-3 mt-5 shadow-lg">
        <Card.Body>
          <h2 className="text-center mb-4">{t('authorProfile.title', { username: profileData.username || '-' })}</h2>
          <Form>
            <Row className="mb-3">
              <Col sm={6}>
                <Form.Group as={Row} className='field-box'>
                  <Form.Label column sm={4}>{t('authorProfile.name')}</Form.Label>
                  <Col sm={8} className='p-0'>
                    {editing ? 
                      <Form.Control type="text" name="fullname" value={profileData.fullname || ''} onChange={handleInputChange} /> :
                      <div>{profileData.fullname || '-'}</div>
                    }
                  </Col>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group as={Row} className={`field-box ${editing ? 'onlyread-field' : ''}`}>
                  <Form.Label column sm={4}>{t('authorProfile.username')}</Form.Label>
                  <Col sm={8} className='p-0'>
                    {editing ?
                      <Form.Control className='ps-1' readOnly plaintext value={profileData.username} /> :
                      <div>{profileData.username || '-'}</div>
                    }
                  </Col>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col sm={6}>
                <Form.Group as={Row} className='field-box'>
                  <Form.Label column sm={4}>{t('authorProfile.email')}</Form.Label>
                  <Col sm={8} className='p-0'>
                    {editing ?
                      <Form.Control type="email" name="email" value={profileData.email || ''} onChange={handleInputChange} /> :
                      <div>{profileData.email || '-'}</div>
                    }
                  </Col>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group as={Row} className='field-box'>
                  <Form.Label column sm={4}>{t('authorProfile.phone')}</Form.Label>
                  <Col sm={8} className='p-0'>
                    {editing ?
                      <Form.Control type="tel" name="phonenumber" value={profileData.phonenumber || ''} onChange={handleInputChange} /> :
                      <div>{profileData.phonenumber || '-'}</div>
                    }
                  </Col>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group as={Row} className='field-box'>
                  <Form.Label column sm={4}>{t('authorProfile.interests')}</Form.Label>
                  <Col sm={8} className='p-0'>
                    {editing ?
                      <TagsInput tags={intereses} setTags={setIntereses} persPlaceholder="áreas de interés" /> :
                      <div>{intereses.length > 0 ? intereses.join(', ') : '-'}</div>
                    }
                  </Col>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group as={Row} className={`field-box ${editing ? 'onlyread-field' : ''}`}>
                  <Form.Label column sm={4}>{t('authorProfile.registrationDate')}</Form.Label>
                  <Col sm={8} className='p-0'>
                    {editing ?
                      <Form.Control className='ps-1' readOnly plaintext value={profileData.registration_date} /> :
                      <div>{profileData.registration_date || '-'}</div>
                    }
                  </Col>
                </Form.Group>
              </Col>
            </Row>
            <Row className="justify-content-between">
              <Col sm="auto">
                <Button variant="primary" onClick={editing ? handleSaveClick : handleEditClick}>
                  {editing ? t('authorProfile.save') : t('authorProfile.editProfile')}
                </Button>
              </Col>
              {editing && (
                <Col sm="auto">
                  <Button variant="secondary" onClick={handleEditCancel}>{t('authorProfile.cancel')}</Button>
                </Col>
              )}
              {profileData.is_bi && !editing && (
                <Col sm="auto">
                  <Button variant="secondary" onClick={handleChangeRole}>{t('authorProfile.changeToReviewer')}</Button>
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