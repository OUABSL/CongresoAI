import React, { useState, useContext } from 'react'
import { Card, Form, Row, Col, Button} from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';
import { AlertContext } from '../../context/alertProvider';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "../estilos/register.css"





const SignUpAuthor = () => {
  const { alert, setAlert } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();



  const initialState = {
    role: 'author',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullname: '',
    birthdate: '',
    phonenumber: '',
    interestarea: ''
  }

  const [state, setState] = useState(initialState);

  const onSubmit = (e) => {
    e.preventDefault();
    for (let key in state) {
      if (state[key] === '') {
        setAlert({
          show: true,
          message: 'Todos los campos son obligatorios',
          variant: 'danger'
        });
        return;
      }
    }

    if (state.password !== state.confirmPassword) { 
      setLoading(false);
      return setAlert({
          show: true,
          message: "Las contraseñas no coinciden!",
          variant: "danger"
      });
    } else{
      delete state.confirmPassword;
    }

    setLoading(true);
    

    fetch('/api/v1/signup', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(state)
    })
    .then(response => {
      if (!response.ok) { throw Error(response.statusText); }
      return response.json();
    })
    .then(data => {
        console.log(data.message);

        setAlert({
          show: true, 
          message: data.message, 
          variant: data.success ? "success" : "danger"
        });
        if(data.success) return navigate("/portal-author/login")
    })
    .catch((error) => console.log(error))
    .finally(() => {
      setLoading(false);
      setState(initialState);
    });

    setLoading(false);
    setState(initialState)
  }

  const onChange = (e) => setState({...state, [e.target.name]: e.target.value});

  return (
    <Card className="register-card mt-2 p-5 mx-auto">
      <Form onSubmit={onSubmit} className="form-class">
        <div className="h4 mb-4 form-heading text-center">Registro de autor</div>         
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
                  required
                />
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
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
          <Col>
            <Form.Group className="mb-3 form-group-class">
              <Form.Label className="label-class">Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="Introduzca su correo electrónico"
                name="email"
                value={state.email}
                onChange={onChange}
                className="input-class"
                required
              />
            </Form.Group>
          </Col>
            <Col>
              <Form.Group className="mb-3 form-group-class">
                  <Form.Label className="label-class">Número de teléfono</Form.Label>
                  <PhoneInput
                      className="number"
                      country={"es"}
                      value={state.phonenumber}
                      onChange={phone => setState({ ...state, phonenumber: phone })}
                  />
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
                required
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
          <Form.Label className="label-class">Área de interés</Form.Label>
          <Form.Control
            type="text"
            placeholder="Elija sus áreas de interés"
            name="interestarea"
            value={state.interestarea}
            onChange={onChange}
            className="input-class"
            required
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
        ¿Ya está registrado? <Link to="/portal-author/login">iniciar sesión!</Link>
      </p>
    </Form>
    </Card>
    )
  }

  export default SignUpAuthor;