import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { useContext } from "react";
import AuthContext from "../../context/context";
import { AlertContext } from '../../context/alertProvider'; // Importa tu contexto


function RegenerationModal({ username, articleTitle }) {
  const [show, setShow] = useState(false);
  const {sessionToken, logout } = useContext(AuthContext);
  const {alert, setAlert} = useContext(AlertContext);
  const [selected, setSelected] = useState({
    summary: false,
    initialEvaluation: false,
    dataPreparation: false,
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCheck = (event) => {
    setSelected({
      ...selected,
      [event.target.name]: event.target.checked
    });
  };


const handleConfirm = async () => {
  try {
    const tasks = Object.entries(selected).filter(([key, value]) => value).map(([key, value]) => key);

    if (tasks.length === 0) {
      setAlert({show: true, message: "Seleccione al menos una tarea para regenerar.", variant: "warning"});
      return;
    }

    handleClose();

    const response = await fetch(`/api/v1/reevaluate/${username}/${articleTitle}`, {
      method: 'PUT',
      body: JSON.stringify(tasks),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      }
    });

    if (response.status === 401) {
      logout();
      setAlert({show: true, message: "Por favor, inicie sesión de nuevo.", variant: "info"});
      return;
    }

    if (response.status === 500) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    if (response.status === 200) {
      setAlert({show: true, message: "Reevaluación iniciada con éxito. Vuelva a comprobar el resultado en 5 minutos.", variant: "success"});
    } else {
      setAlert({show: true, message: "Error en la reevaluación. Avise al administrador", variant: "danger"});
    }

  } catch (error) {
    setAlert({show: true, message: "Ha sucedido un error en el proceso. Por favor, inténtalo más tarde.", variant: "danger"});
    console.error(error);
  }

};

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Re-evaluate
      </Button>
    
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Selecciona el componente a regenerar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Check 
              name="summary"
              type="checkbox"
              label="Resumen"
              onChange={handleCheck}
            />
            <Form.Check 
              name="initialevaluation"
              type="checkbox"
              label="Evaluación Inicial"
              onChange={handleCheck}
            />
            <Form.Check 
              name="datapreparation"
              type="checkbox"
              label="Preparación De Datos"
              onChange={handleCheck}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default RegenerationModal;