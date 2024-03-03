import React, { useState } from "react";
import { Form, Button, Alert, Card } from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';

import "../estilos/login.css";


const LoginRevisor = () => {
  const [username, setInputUsername] = useState("");
  const [password, setInputPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); 
  const [alertVariant, setAlertVariant] = useState("danger");
  const navigate = useNavigate();


  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const payload = {
      "rol": "reviewer",
      username,
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
      setAlertVariant("success");
      setAlertMessage("Login Successful");

      localStorage.setItem('rol', "reviewer");
      localStorage.setItem('username', username);
      localStorage.setItem('access_token', result.access_token);

      navigate(`/portal-reviewer/profile/${username}`);
    } else {
      // Show error message
      console.log(`Login failed ${response.status}`);
      setAlertVariant("danger");
      setAlertMessage(`Login failed`);
    }
    
    setShow(true);
    setInputPassword("");
    setLoading(false);
  };


  return (
    <Card>
      <Form className="shadow p-4 bg-white rounded" onSubmit={handleSubmit}>
        <div className="h4 mb-2 text-center">Reviewer Access</div>
       
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
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            value={username}
            placeholder="Username / Email"
            onChange={(e) => setInputUsername(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-2" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setInputPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-2" controlId="checkbox">
          <Form.Check type="checkbox" label="Remember me" />
        </Form.Group>
   
        {!loading ? (
          <Button className="w-100" variant="primary" type="submit">
            Log In
          </Button>
        ) : (
          <Button className="w-100" variant="primary" type="submit" disabled>
            Logging In...
          </Button>
        )}
   
        <div className="dm-grid">
        <Link style={{ cursor: "pointer" }} className='text-muted link-above'>Forgot your password?</Link>
        </div>

        <div className="dm-grid">
        <Link to="/portal-revisor/register" className='text-muted link-above'>Don't have an account yet? Contact us!</Link>
        </div>
      </Form>
    </Card>
  );
};

export default LoginRevisor;