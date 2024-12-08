import React, { useState, useEffect, useContext } from "react";
import { Form, Button, Alert, Container, Row, Card } from "react-bootstrap";
import { BsMap, BsEnvelope, BsTelephone } from "react-icons/bs";
import TextareaAutosize from 'react-textarea-autosize';
import { AlertContext } from '../context/alertProvider';
import { useTranslation } from 'react-i18next';

import './estilos/contactus.css';

const ContactForm = ({ formState, handleFormSubmit, handleInputChange }) => {
  const { t } = useTranslation();

  return (
    <Form onSubmit={handleFormSubmit}>
      {["name", "email", "subject"].map((field, index) => (
        <Form.Group className="mb-3" key={index}>
          <Form.Label>{t(`contactUs.fields.${field}`)}</Form.Label>
          <Form.Control
            type="text"
            placeholder={t(`contactUs.placeholder.${field}`)}
            value={formState[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
          />
        </Form.Group>
      ))}
      <Form.Group className="mb-3">
        <Form.Label>{t('contactUs.fields.message')}</Form.Label>
        <TextareaAutosize
          minRows={3}
          style={{ width: '100%' }}
          placeholder={t('contactUs.placeholder.message')}
          value={formState.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        {t('contactUs.submit')}
      </Button>
    </Form>
  );
};

const ContactInfo = () => {
  const { t } = useTranslation();

  return (
    <>
      {[
        { icon: <BsMap size={32} />, title: t('contactUs.address.title'), text: t('contactUs.address.text') },
        { icon: <BsEnvelope size={32} />, title: t('contactUs.email.title'), text: t('contactUs.email.text') },
        { icon: <BsTelephone size={32} />, title: t('contactUs.phone.title'), text: t('contactUs.phone.text') },
      ].map((info, index) => (
        <div className="mb-3" key={index}>
          {info.icon}
          <p>
            <strong>{info.title}:</strong> {info.text}
          </p>
        </div>
      ))}
    </>
  );
};

const ContactUs = () => {
  const { setAlert } = useContext(AlertContext);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [enviado, setEnviado] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('contactUs.title');
  }, [t]);

  useEffect(() => {
    if (enviado) {
      const formResetTimeout = setTimeout(() => {
        setFormState({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setEnviado(false);
      }, 3000);
      return () => clearTimeout(formResetTimeout);
    }
  }, [enviado]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setAlert({
      show: true,
      message: t('contactUs.alertMessage'),
      variant: 'info',
    });
  };

  const handleInputChange = (field, value) => {
    setFormState({
      ...formState,
      [field]: value,
    });
  };

  return (
    <Container className="d-flex flex-column align-items-center">
      <Row>
        {alert.show && (
          <Alert variant={alert.variant} onClose={() => setAlert({...alert, show: false})} dismissible>
            {alert.message}
          </Alert>
        )}
      </Row>
      <Card style={{ maxWidth: '600px' }} className="mt-2 p-5">
        <h1 className="text-center mb-4">{t('contactUs.title')}</h1>
        <Row>
          <p>{t('contactUs.description')}</p>
          <ContactForm
            formState={formState}
            handleFormSubmit={handleFormSubmit}
            handleInputChange={handleInputChange}
          />
        </Row>
      </Card>
    </Container>
  );
};

export default ContactUs;