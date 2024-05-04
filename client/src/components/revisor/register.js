import React, { useState, useContext, useEffect } from 'react';
import { Card, Form, Row, Col, Button} from "react-bootstrap";
import { Link, useNavigate} from 'react-router-dom';
import { AlertContext } from '../../context/alertProvider';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "../estilos/register.css";
import TagsInput from '../tagsInput';
import { validateForm } from '../validators/register';



const SignUpRevisor = () => {
  const {setAlert } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [knowledges, setTags] = useState([]);


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

    for (let key in state) {
      if (state[key] === '') {
        setAlert({
          show: true,
          message: `Todos los campos son obligatorios! Completa el campo ${key}.`,
          variant: 'danger'
        });
        return;
      }
    }
    let errors = validateForm(state.email, state.ORCID_ID, state.phonenumber, state.password, state.confirmPassword);

    if (errors.length > 0) {
      setLoading(false);
        setAlert({
          show: true,
          message: errors.map(x=> "-" + x + "\n"),
          variant: "danger"
        });
        return;
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
      console.log(JSON.stringify(data.message));
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
    })
    .catch((error) => console.log(JSON.stringify(error)))
    .finally(() => {
      setLoading(false);
    });
  }

  const onChange = (e) => {
    if(e.target.name === "is_bi") 
      setState({...state, [e.target.name]: e.target.checked});
    else 
      setState({...state, [e.target.name]: e.target.value});
  }

  useEffect(() => {
    setState(currentState => ({ ...currentState, knowledges: knowledges }))
  }, [knowledges]);
  return (
    <Card className="register-card mt-2 p-5 mx-auto">
        <Form onSubmit={onSubmit} className="form-class">
            <div className="h4 mb-4 form-heading text-center">Registro de revisor</div>
            <Row>
              <Col  xs={12} md={6}>
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
            <Col  xs={12} md={6}>
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
            <Col  xs={12} md={6}>
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
            <Col  xs={12} md={6}>
              <Form.Group className="mb-3 form-group-class">
                <Form.Label className="label-class">Correo electrónico</Form.Label>
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
            <Col  xs={12} md={6}>
              <Form.Group className="mb-3 form-group-class">
                  <Form.Label className="label-class">Número de teléfono</Form.Label>
                  <PhoneInput
                      inputClass="input-class"
                      className="number"
                      country={"es"}
                      value={state.phonenumber}
                      placeholder='+34 611 111 111'
                      onChange={phone => setState({ ...state, phonenumber: phone })}
                  />
              </Form.Group>
            </Col>
          </Row>
          <Row>
          <Col  xs={12} md={6}>
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
            <Col  xs={12} md={6}>
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
          <TagsInput tags={knowledges} setTags={setTags} persPlaceholder="áreas de conocimientos" />
        </Form.Group>

        <Form.Group controlId="formBasicCheckbox" className='p-2 mb-2'>
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