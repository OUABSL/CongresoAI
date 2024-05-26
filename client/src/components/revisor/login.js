import React, { useState, useContext, useEffect } from "react";
import { Form, Button, Card, FloatingLabel, Modal } from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';
import "../estilos/login.css";
import { useAuth } from "../../context/appProvider";
import { AlertContext } from '../../context/alertProvider';
import copy from 'copy-to-clipboard';


const LoginRevisor = () => {
  const [usernameInput, setInputUsername] = useState("");
  const [password, setInputPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  const { setSessionToken, setRole, setUsername } = useAuth();
  const [showModal, setShowModal] = useState(false);

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

      const result = await response.json();


      if (response.status === 200) {
        setSessionToken(result.access_token);
        setUsername(usernameInput);
        setRole("reviewer");

        setAlert({ show: true, message: "Login Exitoso", variant: "success" });
        navigate(`/portal-reviewer/profile/${usernameInput}`, { replace: true });
      } else if(response.status === 404){
        setAlert({ show: true, message: "No existe el usuario", variant: "danger" });
      } else {
        setAlert({ show: true, message: "Usuario o contraseña incorrectos", variant: "danger" });
      }
    } catch (error) {
      setAlert({ show: true, message: error.message, variant: "danger" });
    }

    setLoading(false);
  };

  const handlePassword = () => {
    setAlert({ show: true, message: "Funcionalidad en desarrollo!", variant: "info" });
  };

  const handleContactAdmin = () => {
    setShowModal(true);
  };

  const closeModal = () => {
      setShowModal(false);
  };

  const handleCopyEmail = () => {
      copy('ouabou@alum.us.es');
      setAlert({ show: true, message: "Correo copiado al portapapeles", variant: "info" });
  };

  const handleOpenEmailApp = () => {
      window.location.href = `mailto:ouabou@alum.us.es?subject=THE AI CONGRESS - Solicitud de enlace de registro de revisor&body=ORCID:`;
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
          <Link className='text-muted link-above' onClick={handleContactAdmin}>¿No tienes una cuenta? ¡Contacte con el administrador!</Link>
        </div>
      </Form>

      {/* Modal para contactar al administrador */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
            <Modal.Title>Contactar al Administrador</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p className="text-center">Se ruega indicar el ORCID del investigador para recibir el enlace personalizado.<br />
              Puede contactar al administrador de la siguiente manera:</p>
              <div className="d-flex justify-content-around">
                <Button onClick={handleCopyEmail}>Copiar Correo</Button>
                <Button onClick={handleOpenEmailApp}>Enviar Correo</Button>
              </div>
        </Modal.Body>
      </Modal>
    </Card>
  );
};

export default LoginRevisor;
