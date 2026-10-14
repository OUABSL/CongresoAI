import React, { useState, useContext, useEffect } from "react";
import { Form, Button, Card, FloatingLabel } from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';
import { AlertContext } from '../../context/alertProvider';
import { useAuth } from "../../context/appProvider";
import { useTranslation } from "react-i18next";
import "../estilos/login.css";

const LoginAuthor = () => {
  const { t } = useTranslation();
  const [usernameInput, setInputUsername] = useState("");
  const [password, setInputPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  const { setSessionToken, setRole, setUsername } = useAuth();

  useEffect(() => {
    document.title = t("loginAuthor.title");
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      "rol":"author",
      "username":usernameInput,
      "password":password
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
          setTimeout(() => reject(new Error(t("loginAuthor.timeout"))), 10000)
        ),
      ]);

      const result = await response.json()

      if (response.status===200) {
        setSessionToken(result.access_token);
        setUsername(usernameInput);
        setRole("author");
        
        setAlert({ show: true, message: t("loginAuthor.success"), variant: "success" });
        navigate(`/portal-author/profile/${usernameInput}`);
      } else if(response.status === 404){
        setAlert({ show: true, message: t("loginAuthor.userNotFound"), variant: "danger" });
      } else {
        setAlert({ show: true, message: t("loginAuthor.invalidCredentials"), variant: "danger" });
      }
    } catch (error) {
      setAlert({ show: true, message: error.message, variant: "danger" });
    }
      
    setLoading(false);
  };
  
  const handlePassword = () => {
    setAlert({ show: true, message: t("loginAuthor.development"), variant: "info" });

  };

  return (
    <Card className="form-card mx-auto">
      <Form className="login-form shadow p-4 bg-white rounded" onSubmit={handleSubmit}>
        <div className="h4 mb-2 text-center">{t("loginAuthor.title")}</div>
        <FloatingLabel controlId="floatingUsername" label={t("loginAuthor.username")} className="mb-3">
          <Form.Control
            type="text"
            value={usernameInput}
            onChange={(e) => setInputUsername(e.target.value)}
            required
          />
        </FloatingLabel>
        <FloatingLabel controlId="floatingPassword" label={t("loginAuthor.password")}>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setInputPassword(e.target.value)}
            required
          />
        </FloatingLabel>
        <Form.Group className="mt-2" controlId="checkbox">
          <Form.Check type="checkbox" label={t("loginAuthor.rememberMe")} />
        </Form.Group>
        <div className="d-grid gap-2">
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? t("loginAuthor.loggingIn") : t("loginAuthor.loginButton")}
          </Button>
        </div>
        <div className="d-grid mt-3">
          <Link onClick={handlePassword} className='text-muted link-above'>{t("loginAuthor.forgotPassword")}</Link>
        </div>
        <div className="d-grid mt-2">
          <Link to="/portal-author/register" className='text-muted link-above'>{t("loginAuthor.noAccount")}</Link>
        </div>
      </Form>
    </Card>
  );
};
export default LoginAuthor;