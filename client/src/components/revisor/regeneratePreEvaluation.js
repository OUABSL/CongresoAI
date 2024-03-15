import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';

function RegenerationModal({ username, articleTitle }) {
  const [show, setShow] = useState(false);
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

  const handleConfirm = () => {
    // Convert selected items to array
    const tasks = Object.keys(selected).filter(key => selected[key]);

    fetch(`/api/v1/reevaluate/${username}/${articleTitle}?tasks=${tasks.toString()}`)
      .then(response => response.json())
      .then(data => console.log(data));

    handleClose();
  }

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