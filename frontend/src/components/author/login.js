import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { Link } from 'react-router-dom';

import "../estilos/login.css";


const Login = () => {
  const [username, setInputUsername] = useState("");
  const [password, setInputPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); 
  const [alertVariant, setAlertVariant] = useState("danger");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const payload = {
      username,
      password
    };

    // fetch() método para hacer una solicitud POST
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload) // Pasamos la información del payload a JSON
    });

    const result = await response.json()

    if (response.status===200) {
      // El login fue exitoso, redirige al usuario a donde quieras
      console.log(result)
      console.log("Login Exitoso");
      setAlertVariant("success");
      setAlertMessage("Login Exitoso");
    } else {
      // Mostrar mensaje de error
      console.log(`Error en el Login ${response.status}`);
      setAlertVariant("danger");
      setAlertMessage(`Error en el Login`);
    }

    await delay(500);
    console.log(`Usuario :${username}, Contraseña :${password}`);
    if (username !== "admin" || password !== "admin") {
      setShow(true);
    }
    setLoading(false);
  };

  const handlePassword = () => {
  };

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }


  return (
    <div className="sign-in__wrapper">
      {/* Overlay */}
      {/* Form */}
      <Form className="shadow p-4 bg-white rounded" onSubmit={handleSubmit}>
        {/* Header */}

        <div className="h4 mb-2 text-center">Acceso de autor</div>
        {/* Alert */}
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
          <Form.Label>Usuario</Form.Label>
          <Form.Control
            type="text"
            value={username}
            placeholder="Nombre de usuario / Correo eléctronico"
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
          <Button className="w-100" variant="primary" type="submit">
            Iniciar Sesión
          </Button>
        ) : (
          <Button className="w-100" variant="primary" type="submit" disabled>
            Iniciando Sesión...
          </Button>
        )}
        <div className="d-grid">
        <Link onClick={handlePassword} className='text-muted link-above'>¿Olvidaste tu contraseña?</Link>
          </div>
        <div className="d-grid">
        <Link to="/portal-author/register" className='text-muted link-above'>¿No tienes una cuenta aún? Registrese!</Link>
        </div>
      </Form>
    </div>
  );
};

export default Login;