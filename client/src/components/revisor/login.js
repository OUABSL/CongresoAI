import React, { useState, useContext, useEffect } from "react";
import { Form, Button, Card, FloatingLabel, Modal } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Importación de i18next
import { useAuth } from "../../context/appProvider";
import { AlertContext } from "../../context/alertProvider";
import copy from "copy-to-clipboard";

const LoginRevisor = () => {
  const { t } = useTranslation(); // Hook de i18next
  const [usernameInput, setInputUsername] = useState("");
  const [password, setInputPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  const { setSessionToken, setRole, setUsername } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    document.title = t("loginReviewer.title");
  }, [t]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      rol: "reviewer",
      username: usernameInput,
      password
    };

    try {
      const response = await Promise.race([
        fetch("/api/v1/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(t("loginReviewer.requestTimeout"))), 10000)
        )
      ]);

      const result = await response.json();

      if (response.status === 200) {
        setSessionToken(result.access_token);
        setUsername(usernameInput);
        setRole("reviewer");

        setAlert({ show: true, message: t("loginReviewer.success"), variant: "success" });
        navigate(`/portal-reviewer/profile/${usernameInput}`, { replace: true });
      } else if (response.status === 404) {
        setAlert({ show: true, message: t("loginReviewer.userNotFound"), variant: "danger" });
      } else {
        setAlert({ show: true, message: t("loginReviewer.invalidCredentials"), variant: "danger" });
      }
    } catch (error) {
      setAlert({ show: true, message: error.message, variant: "danger" });
    }

    setLoading(false);
  };

  const handlePassword = () => {
    setAlert({ show: true, message: t("loginReviewer.passwordFeature"), variant: "info" });
  };

  const handleContactAdmin = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleCopyEmail = () => {
    copy("ouabou@alum.us.es");
    setAlert({ show: true, message: t("loginReviewer.emailCopied"), variant: "info" });
  };

  const handleOpenEmailApp = () => {
    window.location.href = `mailto:ouabou@alum.us.es?subject=${t(
      "loginReviewer.emailSubject"
    )}&body=ORCID:`;
  };

  return (
    <Card className="form-card mx-auto">
      <Form className="login-form shadow p-4 bg-white rounded" onSubmit={handleSubmit}>
        <div className="h4 mb-2 text-center">{t("loginReviewer.title")}</div>

        <FloatingLabel
          controlId="floatingUsername"
          label={t("loginReviewer.username")}
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
        <FloatingLabel controlId="floatingPassword" label={t("loginReviewer.password")}>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setInputPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </FloatingLabel>
        <Form.Group className="mt-2" controlId="checkbox">
          <Form.Check type="checkbox" label={t("loginReviewer.rememberMe")} />
        </Form.Group>
        <div className="d-grid gap-2">
          <Button className="mx-auto" variant="primary" type="submit" disabled={loading}>
            {loading ? t("loginReviewer.loggingIn") : t("loginReviewer.loginButton")}
          </Button>
        </div>
        <div className="d-grid mt-3">
          <Link onClick={handlePassword} className="text-muted link-above">
            {t("loginReviewer.forgotPassword")}
          </Link>
        </div>
        <div className="d-grid mt-2">
          <Link className="text-muted link-above" onClick={handleContactAdmin}>
            {t("loginReviewer.contactAdmin")}
          </Link>
        </div>
      </Form>

      {/* Modal para contactar al administrador */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t("loginReviewer.modalTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-center">{t("loginReviewer.modalBody")}</p>
          <div className="d-flex justify-content-around">
            <Button onClick={handleCopyEmail}>{t("loginReviewer.copyEmail")}</Button>
            <Button onClick={handleOpenEmailApp}>{t("loginReviewer.sendEmail")}</Button>
          </div>
        </Modal.Body>
      </Modal>
    </Card>
  );
};

export default LoginRevisor;
