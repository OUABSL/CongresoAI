import React, { useState, useContext, useEffect } from 'react';
import { Card, Form, Row, Col, Button} from "react-bootstrap";
import { Link, useNavigate, useParams} from 'react-router-dom';
import { AlertContext } from '../../context/alertProvider';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "../estilos/register.css";
import TagsInput from '../tagsInput';
import { validateForm } from '../validators/register';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faSpinner } from '@fortawesome/free-solid-svg-icons';


const SignUpRevisor = () => {
  const {setAlert } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [knowledges, setTags] = useState([]);
  const { token } = useParams();
  const [first, setFirst] = useState(false);
  const [valid, setValid] = useState(false);

  const initialState = {
    role: 'reviewer',
    ORCID: '',   // 0000-0003-0528-9459
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullname: '',
    phonenumber: '',
    knowledges: [],
    is_bi:false,
    token:token
  }



  
  useEffect(() => {
    document.title = `Registro de revisor `;
  }, []);

  useEffect(() => {
    async function verifyToken() {
      try {
        const response = await fetch(`/api/v1/verify-token/${token}`);
        const data = await response.json();
        setFirst(true);
        if (data.success){
          setValid(true);
        } else {
          setValid(false);
        }
      } catch(error) {
        console.log(error);
      }
    }
    verifyToken();
  }, [token]);


  const formatORCID = (value) => {
    // Eliminar cualquier guión existente para evitar duplicados
    const cleanedValue = value.replace(/-/g, '');
    // Dividir los caracteres en bloques de cuatro
    const grouped = cleanedValue.match(/.{1,4}/g);
    // Unir los bloques con guiones intermedios
    return grouped ? grouped.join('-') : '';
}


const handleORCIDChange = (e) => {
  let value = e.target.value.replace(/-/g, '');
  value = value.substring(0, 16); 
  const formattedORCID = formatORCID(value);
  setState({ ...state, ORCID: formattedORCID });
}


  const [state, setState] = useState(initialState);
  const onSubmit = (e) => {
    setLoading(true);
    e.preventDefault();

    for (let key in state) {
      console.log(state[key]);
      if (state[key] === '') {
        setAlert({
          show: true,
          message: `Todos los campos son obligatorios! Completa el campo ${key}.`,
          variant: 'danger'
        });
        setLoading(false);
        return;
      }
    }

    let errors = validateForm({ 
      email: state.email, 
      orcid: state.ORCID,
      phone: state.phonenumber, 
      password: state.password, 
      confirmPassword: state.confirmPassword 
    });
    
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

    const body = { ...state, token: token };

    fetch('/api/v1/signup', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    .then(response => {
      // guarda el status en, por ejemplo, status
      // convierte el cuerpo de la respuesta a objeto JavaScript
      const status = response.status;
      return response.json().then(data => ({ status, data }));
    })
    .then(({ status, data }) => {
      console.log(JSON.stringify(data.message));
      if (status ===201) {
        setAlert({
          show: true,
          message: "Registro correcto",
          variant: "success"
        });
        return navigate('/portal-reviewer/login');
      } else if(status === 400){
        setAlert({
          show: true, 
          message: "Nombre de usuario ya existe!", 
          variant: "danger"
        });
      }
      else if(status===401){
        setAlert({
          show: true, 
          message: "Registro no autorizado! ORCID incorrecto.", 
          variant: "danger"
        });
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error));
      setAlert({
        show: true, 
        message: "Ha sucecido error en el registro! Intentálo de nuevo más tarde.", 
        variant: "danger"
      });
    })
    .finally(() => {
      setLoading(false);
    });
  }

  const onChange = (e) => {
    if (e.target.name === "is_bi") 
      setState({...state, [e.target.name]: e.target.value === "yes"});
    else 
      setState({...state, [e.target.name]: e.target.value});
  }

  useEffect(() => {
    setState(currentState => ({ ...currentState, knowledges: knowledges }))
  }, [knowledges]);

  return (
    <Card className="register-card mt-2 p-5 mx-auto">
      {valid ? (
        <Form onSubmit={onSubmit} className="form-class">
            <div className="h4 mb-4 form-heading text-center">Registro de revisor</div>
            <Row>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3 form-group-class">
                  <Form.Label className="label-class">ORCID ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="0000-0000-0000-0000"
                    name="ORCID"
                    value={state.ORCID}
                    className="input-class"
                    onChange={handleORCIDChange}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3 form-group-class">
                  <Form.Label className="label-class">¿Crear portal de autor?</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Sí"
                      name="is_bi"
                      value="yes"
                      checked={state.is_bi === true}
                      onChange={onChange}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="No"
                      name="is_bi"
                      value="no"
                      checked={state.is_bi === false}
                      onChange={onChange}
                    />
                  </div>
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
                  required
                  />
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
    ) : (first ? (
      <div className='d-flex flex-column justify-content-center align-self-center text-center text-danger'>
        <h2><FontAwesomeIcon icon={faCircleExclamation} />¡Registro no autorizado!</h2>
        <h4>Por favor, contacte con el administrador.</h4>
      </div>
    ) :( 
    <div className='d-flex justify-content-center align-items-center'>
      <FontAwesomeIcon icon={faSpinner} size='2x' />
    </div>
    ))}
    </Card>
    );
  }
  export default SignUpRevisor;