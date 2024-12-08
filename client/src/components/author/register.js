import React, { useState, useContext, useEffect } from 'react';
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';
import { AlertContext } from '../../context/alertProvider';
import PhoneInput from "react-phone-input-2";
import { validateForm } from '../validators/register';
import TagsInput from '../tagsInput';
import { useTranslation } from "react-i18next";
import "react-phone-input-2/lib/style.css";
import "../estilos/register.css";

const SignUpAuthor = () => {
  const { t } = useTranslation();
  const { setAlert } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [interestarea, setTags] = useState([]);

  const initialState = {
    role: 'author',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullname: '',
    phonenumber: '',
    interests: ''
  };

  const [state, setState] = useState(initialState);

  useEffect(() => {
    document.title = t("registerAuthor.title");
  }, [t]);

  const onSubmit = (e) => {
    e.preventDefault();
    for (let key in state) {
      if (state[key] === '') {
        setAlert({
          show: true,
          message: t("registerAuthor.emptyField", { field: t(`registerAuthor.fields.${key}`) }),
          variant: 'danger'
        });
        return;
      }
    }

    let errors = validateForm({
      email: state.email,
      phone: state.phonenumber,
      password: state.password,
      confirmPassword: state.confirmPassword
    });

    if (errors.length > 0) {
      setAlert({
        show: true,
        message: errors.map(err => `- ${err}\n`).join(''),
        variant: "danger"
      });
      return;
    } else {
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
        const status = response.status;
        return response.json().then(data => ({ status, data }));
      })
      .then(({ status, data }) => {
        if (status === 400) {
          setAlert({ show: true, message: t("registerAuthor.usernameExists"), variant: "danger" });
        } else if (status === 401) {
          setAlert({ show: true, message: t("registerAuthor.unauthorized"), variant: "danger" });
        } else if (data.success) {
          setAlert({ show: true, message: t("registerAuthor.success"), variant: "success" });
          navigate("/portal-author/login");
        }
      })
      .catch((error) => {
        setAlert({ show: true, message: t("registerAuthor.error"), variant: "danger" });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setState(currentState => ({ ...currentState, interests: interestarea }));
  }, [interestarea]);

  const onChange = (e) => setState({ ...state, [e.target.name]: e.target.value });

  return (
    <Card className="register-card mt-2 p-5 mx-auto">
      <Form onSubmit={onSubmit} className="form-class">
        <div className="h4 mb-4 form-heading text-center">{t("registerAuthor.title")}</div>
        <Row>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3 form-group-class">
              <Form.Label>{t("registerAuthor.fullname")}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t("registerAuthor.fullnamePlaceholder")}
                name="fullname"
                value={state.fullname}
                onChange={onChange}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3 form-group-class">
              <Form.Label>{t("registerAuthor.username")}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t("registerAuthor.usernamePlaceholder")}
                name="username"
                value={state.username}
                onChange={onChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3 form-group-class">
              <Form.Label>{t("registerAuthor.email")}</Form.Label>
              <Form.Control
                type="email"
                placeholder={t("registerAuthor.emailPlaceholder")}
                name="email"
                value={state.email}
                onChange={onChange}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3 form-group-class">
              <Form.Label>{t("registerAuthor.phone")}</Form.Label>
              <PhoneInput
                country={"es"}
                value={state.phonenumber}
                onChange={phone => setState({ ...state, phonenumber: phone })}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3 form-group-class">
              <Form.Label>{t("registerAuthor.password")}</Form.Label>
              <Form.Control
                type="password"
                placeholder={t("registerAuthor.passwordPlaceholder")}
                name="password"
                value={state.password}
                onChange={onChange}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="mb-3 form-group-class">
              <Form.Label>{t("registerAuthor.confirmPassword")}</Form.Label>
              <Form.Control
                type="password"
                placeholder={t("registerAuthor.confirmPasswordPlaceholder")}
                name="confirmPassword"
                value={state.confirmPassword}
                onChange={onChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3 form-group-class">
          <Form.Label>{t("registerAuthor.interests")}</Form.Label>
          <TagsInput tags={interestarea} setTags={setTags} persPlaceholder={t("registerAuthor.interestsPlaceholder")} />
        </Form.Group>
        <div className="d-grid gap-2">
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? t("registerAuthor.registering") : t("registerAuthor.registerButton")}
          </Button>
        </div>
        <p className="forgot-password text-right">
          {t("registerAuthor.alreadyRegistered")} <Link to="/portal-author/login">{t("registerAuthor.loginLink")}</Link>
        </p>
      </Form>
    </Card>
  );
};

export default SignUpAuthor;