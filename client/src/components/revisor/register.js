import React, { useState, useContext } from 'react'
import { Card, Form, Row, Col, Button, Alert } from "react-bootstrap";
import { Link, useNavigate} from 'react-router-dom';
import { AlertContext } from '../../context/alertProvider';
import "../estilos/register.css"


const SignUpRevisor = () => {
  const { alert, setAlert } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const initialState = {
    role: 'reviewer',
    ORCID_ID: '',   // 0000-0003-0528-9459
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullname: '',
    phonenumber: '',
    knowledges: '',
    is_bi:false
  }

  const formatORCID = (value) => {
    // Eliminar todos los caracteres que no sean dígitos
    const digitsOnly = value.replace(/\D/g, '');
    // Agrupar los dígitos en bloques de cuatro
    const grouped = digitsOnly.match(/.{1,4}/g);
    // Unir los bloques con guiones intermedios
    return grouped ? grouped.join('-') : '';
  }

  const handleORCIDChange = (e) => {
    const formattedORCID = formatORCID(e.target.value);
    setState({ ...state, ORCID_ID: formattedORCID });
  }


  const [state, setState] = useState(initialState);
  const onSubmit = (e) => {
    setLoading(true);
    e.preventDefault();

    if (state.password !== state.confirmPassword) { 
      setLoading(false);
      return setAlert({
          show: true,
          message: "Las contraseñas no coinciden!",
          variant: "danger"
      });
    }
    else{
      delete state.confirmPassword;
    }
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
      if (data.success) {
        setAlert({
          show: true,
          message: "Registro correcto",
          variant: "success"
        });
        navigate('/portal-reviewer/login');
      } else {
        setLoading(false);
        setAlert({
          show: true,
          message: data.message,
          variant: "danger"
        });
      }
    });
    setLoading(false);
  }

  const onChange = (e) => {
    if(e.target.name === "is_bi") 
      setState({...state, [e.target.name]: e.target.checked});
    else 
      setState({...state, [e.target.name]: e.target.value});
  }
  return (
    <Card className="register-card mt-2 p-5 mx-auto">
        <Form onSubmit={onSubmit} className="form-class">
            <div className="h4 mb-4 form-heading text-center">Registro de revisor</div>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>ORCID ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="0000-0000-0000-0000"
                    name="ORCID_ID"
                    value={state.ORCID_ID}
                    onChange={handleORCIDChange}
                  />
                </Form.Group>
              </Col>            
          </Row>
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
            <Col>
            <Form.Group className="mb-3 form-group-class">
              <Form.Label className="label-class">Repita su Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Repita la contraseña"
                name="confirmPassword" 
                value={state.confirmPassword}
                onChange={onChange}
                className="input-class"
              />
            </Form.Group>
            </Col>
          </Row>
        
        <Form.Group className="mb-3 form-group-class">
          <Form.Label className="label-class">Área de Conocimiento</Form.Label>
          <Form.Control
            type="text"
            placeholder="Elija sus áreas de conocimiento"
            name="knowledges"
            value={state.knowledges}
            onChange={onChange}
            className="input-class"
          />
        </Form.Group>

        <Form.Group controlId="formBasicCheckbox">
          <Form.Check type="checkbox" name="is_bi" label="Crear portal de autor?" onChange={onChange} />
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
        ¿Ya está registrado? <Link to="/portal-reviewer/login">iniciar sesión!</Link>
      </p>
    </Form>
    </Card>
    )
  }

  export default SignUpRevisor;