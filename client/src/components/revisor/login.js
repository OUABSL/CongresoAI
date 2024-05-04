import React, { useState, useContext, useEffect } from "react";
import { Form, Button, Card, FloatingLabel } from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';
import "../estilos/login.css";
import { useAuth } from "../../context/appProvider";
import { AlertContext } from '../../context/alertProvider';

const LoginRevisor = () => {
  const [usernameInput, setInputUsername] = useState("");
  const [password, setInputPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  const { setSessionToken, setRole, setUsername } = useAuth();

  useEffect(() => {
    document.title = "Inicio de sesión - Revisor";
  }, []);


  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      "rol": "reviewer",
      "username": usernameInput,
      "password": password
    };

    try {
      const response = await Promise.race([
        fetch('/api/v1/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('La solicitud ha tardado demasiado, por favor intentelo de nuevo')), 10000)
        )
      ]);

      if (response.status === 200) {
        const result = await response.json();
        setSessionToken(result.access_token);
        setUsername(usernameInput);
        setRole("reviewer");

        setAlert({ show: true, message: "Login Exitoso", variant: "success" });
        navigate(`/portal-reviewer/profile/${usernameInput}`, { replace: true });
      } else {
        setAlert({ show: true, message: "Error en el Login", variant: "danger" });
      }
    } catch (error) {
      setAlert({ show: true, message: error.message, variant: "danger" });
    }

    setLoading(false);
  };

  const handlePassword = () => {
    setAlert({ show: true, message: "Funcionalidad en desarrollo!", variant: "info" });
  };

  return (
    <Card className="form-card mx-auto">
      <Form className="login-form shadow p-4 bg-white rounded" onSubmit={handleSubmit}>
        <div className="h4 mb-2 text-center">Acceso de revisor</div>

        <FloatingLabel
          controlId="floatingUsername"
          label="Nombre de usuario"
          className="mb-3"
        >
          <Form.Control
            type="text"
            value={usernameInput}
            onChange={(e) => setInputUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </FloatingLabel>
        <FloatingLabel
          controlId="floatingPassword"
          label="Contraseña"
        >
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setInputPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </FloatingLabel>
        <Form.Group className="mt-2" controlId="checkbox">
          <Form.Check type="checkbox" label="Recuérdame" />
        </Form.Group>
        <div className="d-grid gap-2">
          <Button className="mx-auto" variant="primary" type="submit" disabled={loading}>
            {loading ? "Iniciando Sesión..." : "Iniciar Sesión"}
          </Button>
        </div>
        <div className="d-grid mt-3">
          <Link onClick={handlePassword} className='text-muted link-above'>¿Olvidaste tu contraseña?</Link>
        </div>
        <div className="d-grid mt-2">
          <Link to="ouabou@alum.us.es" className='text-muted link-above'>¿No tienes una cuenta? ¡Contacte con el administrador!</Link>
        </div>
      </Form>
    </Card>
  );
};

export default LoginRevisor;
