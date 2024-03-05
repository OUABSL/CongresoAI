import React, { useState } from "react";
import { Form, Button, Alert, Card } from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';
import "../estilos/login.css";

const Login = () => {
  const [username, setInputUsername] = useState("");
  const [password, setInputPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      "rol":"author",
      username,
      password
    };
    const response = await fetch('/api/v1/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json()

    if (response.status===200) {
      localStorage.setItem('username', username);
      localStorage.setItem('rol', "author");
      localStorage.setItem('access_token', result.access_token);

      setAlert({ show: true, message: "Login Exitoso", variant: "success" });
      navigate(`/portal-author/profile/${username}`, { replace: true });
      window.location.reload(); 
    } else {
      setAlert({ show: true, message: "Error en el Login", variant: "danger" });
    }
    setLoading(false);
  };
  
  const handlePassword = () => {};

  return (
    <Card className="form-card mx-auto">
      <Form className="login-form shadow p-4 bg-white rounded" onSubmit={handleSubmit}>
        <div className="h4 mb-2 text-center">Acceso de autor</div>
        {alert.show && 
          <Alert
            className="mb-2 mx-auto"
            variant={alert.variant}
            onClose={() => setAlert({ ...alert, show: false })}
            dismissible
          >
            {alert.message}
          </Alert>
        }
        <Form.Group className="mb-2" controlId="username">
          <Form.Label>Usuario</Form.Label>
          <Form.Control
            type="text"
            value={username}
            placeholder="Nombre de usuario / Correo electrónico"
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
            <Button className="mx-auto" variant="primary" type="submit">
              Iniciar Sesión
            </Button>
          </div>
        ) : (
          <div className="d-grid gap-2">
            <Button className="mx-auto" variant="primary" type="submit" disabled>
              Iniciando Sesión...
            </Button>
          </div>
        )}
        <div className="d-grid">
          <Link onClick={handlePassword} className='text-muted link-above'>¿Olvidaste tu contraseña?</Link>
        </div>
        <div className="d-grid">
          <Link to="/portal-author/register" className='text-muted link-above'>¿No tienes una cuenta aún? ¡Regístrate!</Link>
        </div>
      </Form>
    </Card>
  );
};
export default Login;