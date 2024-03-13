import React, { useState } from 'react'
import { Card, Form, Row, Col, Button, Alert } from "react-bootstrap";
import { Link } from 'react-router-dom';
import "../estilos/register.css"


const SignUpRevisor = () => {
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [loading, setLoading] = useState(false);


  const initialState = {
    email: '',
    username: '',
    password: '',
    fullname: '',
    birthdate: '',
    phonenumber: '',
    interestarea: ''
  }

  const [state, setState] = useState(initialState);

  const onSubmit = (e) => {
    setLoading(true);
    e.preventDefault();

    fetch('/api/v1/signup', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(state)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);

        setAlert({
          show: true, 
          message: data.message, 
          variant: data.success ? "success": "danger"
        });
    });
    setLoading(false);
    setState(initialState)
  }

  const onChange = (e) => setState({...state, [e.target.name]: e.target.value});

  return (
    <Card className="register-card mt-2 p-5 mx-0">
        <Form onSubmit={onSubmit} className="form-class">
            <div className="h4 mb-4 form-heading text-center">Registro de revisor</div>
              
            {alert.show && (
              <Alert variant={alert.variant} onClose={() => setAlert({...alert, show: false})} dismissible>
                {alert.message}
              </Alert>
            )}
          <Row>
            <Col>
              <Form.Group className="mb-3 form-group-class">
                <Form.Label className="label-class">Nombre completo</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nombre completo"
                  name="fullname"
                  value={state.fullname}
                  onChange={onChange}
                  className="input-class"
                  required                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3 form-group-class">
                <Form.Label className="label-class">Nombre de usuario</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nombre de usuario"
                  name="username"
                  value={state.username}
                  onChange={onChange}
                className="input-class"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group className="mb-3 form-group-class">
                <Form.Label className="label-class">Fecha de Nacimiento</Form.Label>
                <Form.Control
                  type="date"
                  name="birthdate"
                  value={state.birthdate}
                  onChange={onChange}
                  className="input-class"
                  required                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3 form-group-class">
                <Form.Label className="label-class">Número de teléfono</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Introduzca su número de teléfono"
                  name="phonenumber"
                  value={state.phonenumber}
                  onChange={onChange}
                  className="input-class"
                  required                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
          <Col>
            <Form.Group className="mb-3 form-group-class">
              <Form.Label className="label-class">Dirección de correo electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="Introduzca su correo electrónico"
                name="email"
                value={state.email}
                onChange={onChange}
                className="input-class"
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3 form-group-class">
              <Form.Label className="label-class">Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Introduzca la contraseña"
                name="password"
                value={state.password}
                onChange={onChange}
                className="input-class"
              />
            </Form.Group>
            </Col>
          </Row>
        
        <Form.Group className="mb-3 form-group-class">
          <Form.Label className="label-class">Área de interés</Form.Label>
          <Form.Control
            type="text"
            placeholder="Elija sus áreas de interés"
            name="interestarea"
            value={state.interestarea}
            onChange={onChange}
            className="input-class"
          />
        </Form.Group>

        {!loading ? (
          <div className="d-grid gap-2">
            <Button className="w-50 mx-auto" variant="primary" type="submit">
              Registrarse
            </Button>
          </div>
        ) : (
          <div className="d-grid gap-2">
            <Button className="w-50 mx-auto" variant="primary" type="submit" disabled>
              Registrandose...
            </Button>
          </div>
        )}
      <p className="forgot-password text-right">
        ¿Ya está registrado? <Link to="/portal-revisor/login">iniciar sesión!</Link>
      </p>
    </Form>
    </Card>
    )
  }

  export default SignUpRevisor;