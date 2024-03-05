import React, { useState } from "react";
import { Form, Button, Alert, Card } from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';

import "../estilos/login.css";
import { useContext } from "react";
import AuthContext from "../../context/context";





const LoginRevisor = () => {
  const [usernameInput, setInputUsername] = useState("");
  const [password, setInputPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); 
  const [alertVariant, setAlertVariant] = useState("danger");
  const navigate = useNavigate();
  const { setSessionToken, setRole, setUsername } = useContext(AuthContext);



  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const payload = {
      "rol": "reviewer",
      usernameInput,
      password
    };

    // fetch() method to make a POST request
    const response = await fetch('/api/v1/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload) 
    });

    const result = await response.json()

    if (response.status === 200) {
      setSessionToken(result.access_token);
      setUsername(usernameInput);
      setRole("reviewer")
      setAlertVariant("success");
      setAlertMessage("Login Successful");
      setShow(true);

      /*   
      localStorage.setItem('rol', "reviewer");
      localStorage.setItem('username', username);
      localStorage.setItem('access_token', result.access_token);
      */
      setLoading(false);

      navigate(`/portal-reviewer/profile/${usernameInput}`);
    } else {
      // Show error message
      console.log(`Login failed ${response.status}`);
      setAlertVariant("danger");
      setAlertMessage(`Login failed`);
      setShow(true);
      setLoading(false);
    }    
    setInputPassword("");
  };


return (
    <Card className="form-card mx-auto">
      <Form className="shadow p-4 bg-white rounded" onSubmit={handleSubmit}>
        <div className="h4 mb-2 text-center">Acceso de revisor</div>
       
        {show ? (
        <Alert
          className="mb-2"
          variant={alertVariant}
          onClose={() => setShow(false)}
          dismissible
        >
        {alertMessage}
        </Alert>
        ) : (
          <div />
        )}

        <Form.Group className="mb-2" controlId="username">
          <Form.Label>Nombre de usuario</Form.Label>
          <Form.Control
            type="text"
            value={usernameInput}
            placeholder="Nombre de usuario / Email"
            onChange={(e) => setInputUsername(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-2" controlId="password">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            value={password}
            placeholder="Contraseña"
            onChange={(e) => setInputPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-2" controlId="checkbox">
          <Form.Check type="checkbox" label="Recuérdame" />
        </Form.Group>
   
        {!loading ? (
          <div className="d-grid gap-2">
            <Button className="w-50 mx-auto" variant="primary" type="submit">
              Iniciar Sesión
            </Button>
          </div>
        ) : (
          <div className="d-grid gap-2">
            <Button className="w-50 mx-auto" variant="primary" type="submit" disabled>
              Iniciando Sesión...
            </Button>
          </div>
        )}
   
        <div className="dm-grid">
        <Link style={{ cursor: "pointer" }} className='text-muted link-above'>¿Olvidaste tu contraseña?</Link>
        </div>

        <div className="dm-grid">
        <Link to="/portal-revisor/register" className='text-muted link-above'>¿Aún no tienes una cuenta? ¡Contáctanos!</Link>
        </div>
      </Form>
    </Card>
  );
};
export default LoginRevisor;