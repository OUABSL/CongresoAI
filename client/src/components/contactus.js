import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Container, Row, Col, Card } from "react-bootstrap";
import { BsMap, BsEnvelope, BsTelephone } from "react-icons/bs";
import TextareaAutosize from 'react-textarea-autosize';

import './estilos/contactus.css'

const ContactForm = ({ formState, handleFormSubmit, handleInputChange }) => {
  return (
    <Form onSubmit={handleFormSubmit}>
      {["nombre", "email", "asunto"].map((field, index) => (
        <Form.Group className="mb-3" key={index}>
          <Form.Label>{field.toUpperCase()}</Form.Label>
          <Form.Control
            type="text"
            placeholder={`Tu ${field}`}
            value={formState[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
          />
        </Form.Group>
      ))}
      <Form.Group className="mb-3">
        <Form.Label>MENSAJE</Form.Label>
        <TextareaAutosize
          minRows={3}
          style={{ width: '100%', minRows: '3' }}
          value={formState.mensaje}
          onChange={(e) => handleInputChange('mensaje', e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        Enviar mensaje
      </Button>
    </Form>
  );
};

const ContactInfo = () => (
  <>
    {[
      { icon: <BsMap size={32} />, title: "Dirección", text: "Calle Mayor, 123, Ciudad" },
      { icon: <BsEnvelope size={32} />, title: "Correo Electrónico", text: "info@ejemplo.com" },
      { icon: <BsTelephone size={32} />, title: "Teléfono", text: "+123 456 7890" },
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

const ContactUs = () => {
  const [formState, setFormState] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: "",
  });
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    if (enviado) {
      const formResetTimeout = setTimeout(() => {
        setFormState({
          nombre: "",
          email: "",
          asunto: "",
          mensaje: "",
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
      message: 'Funcionalidad en desarrollo',
      variant: 'info'
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
      <Card style={{ maxWidth: '600px' }} className="mt-2 p-5" >
      <h1 className="text-center mb-4">Contáctanos</h1>
      <Row>
          <p>
            Si tienes alguna pregunta o comentario, no dudes en contactarnos.
            Estamos aquí para ayudarte.
          </p>
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