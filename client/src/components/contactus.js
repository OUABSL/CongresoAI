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
          <Form.Label>{t(`contactus.${field}`)}</Form.Label>
          <Form.Control
            type="text"
            placeholder={t(`contactus.placeholder.${field}`)}
            value={formState[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
          />
        </Form.Group>
      ))}
      <Form.Group className="mb-3">
        <Form.Label>{t('contactus.message')}</Form.Label>
        <TextareaAutosize
          minRows={3}
          style={{ width: '100%' }}
          value={formState.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        {t('contactus.send')}
      </Button>
    </Form>
  );
};

const ContactInfo = () => {
  const { t } = useTranslation();

  return (
    <>
      {[
        { icon: <BsMap size={32} />, title: t('contactus.address'), text: "Calle Mayor, 123, Ciudad" },
        { icon: <BsEnvelope size={32} />, title: t('contactus.email'), text: "info@ejemplo.com" },
        { icon: <BsTelephone size={32} />, title: t('contactus.phone'), text: "+123 456 7890" },
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
    document.title = t('contactus.title');
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
      message: t('contactus.development'),
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
        <h1 className="text-center mb-4">{t('contactus.contactUs')}</h1>
        <Row>
          <p>{t('contactus.description')}</p>
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
