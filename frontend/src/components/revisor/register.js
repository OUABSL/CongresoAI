import React, { Component } from 'react'
import { Form, Button, Alert } from "react-bootstrap";
import { Link } from 'react-router-dom';

export default class SignUpRevisor  extends Component {

  state = {
    email: '',
    username: '',
    password: '',
    fullname: '',
    birthdate: '',
    phonenumber: '',
    interestarea: ''
  }

  onSubmit = (e) => {
    e.preventDefault();

    // fetch() método para hacer una solicitud POST
    fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.state) // Pasamos la información del estado del componente a JSON
    })
    .then(response => response.text())
    .then(message => {
        console.log(message);
    });

    // Limpia el estado luego de enviar la solicitud
    this.setState({
        email: '',
        username: '',
        password: '',
        fullname: '',
        birthdate: '',
        phonenumber: '',
        interestarea: ''
    });
  }

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  render() {
    return (
      <Form onSubmit={this.onSubmit}>
        <h3>Registrarse</h3>
        <Form.Group className="mb-3">
          <Form.Label>Nombre completo</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nombre completo"
            name="fullname"
            value={this.state.fullname}
            onChange={this.onChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Nombre de usuario</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nombre de usuario"
            name="username"
            value={this.state.username}
            onChange={this.onChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Fecha de Nacimiento</Form.Label>
          <Form.Control
            type="date"
            name="birthdate"
            value={this.state.birthdate}
            onChange={this.onChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Número de teléfono</Form.Label>
          <Form.Control
            type="number"
            placeholder="Introduzca su número de teléfono"
            name="phonenumber"
            value={this.state.phonenumber}
            onChange={this.onChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Dirección de correo electrónico</Form.Label>
          <Form.Control
            type="email"
            placeholder="Introduzca su correo electrónico"
            name="email"
            value={this.state.email}
            onChange={this.onChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="Introduzca la contraseña"
            name="password"
            value={this.state.password}
            onChange={this.onChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Área de interés</Form.Label>
          <Form.Control
            type="text"
            placeholder="Elija sus áreas de interés"
            name="interestarea"
            value={this.state.interestarea}
            onChange={this.onChange}
          />
        </Form.Group>

        <div className="d-grid">
          <Button variant="primary" type="submit">
            Registrarse
          </Button>
        </div>
        <p className="forgot-password text-right">
          ¿Ya está registrado? <Link to="/portal-author/login">iniciar sesión!</Link>
        </p>
      </Form>
    )
  }
}