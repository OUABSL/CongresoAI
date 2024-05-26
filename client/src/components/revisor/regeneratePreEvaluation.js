import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Card} from 'react-bootstrap';
import { useContext } from "react";
import AuthContext from "../../context/context";
import { AlertContext } from '../../context/alertProvider';


//Dicionario de traducción
const taskTranslations = {
  datapreparation: 'Extracción de contenido',
  summary: 'Resumen automático',
  initialevaluation: 'Evaluación inicial automática',
};

  //Funcion que traduce las tareas al español
const translateTask = task => taskTranslations[task] || task;



function RegenerationModal({ username, articleTitle }) {
  const [show, setShow] = useState(false);
  const { sessionToken, logout } = useContext(AuthContext);
  const {setAlert } = useContext(AlertContext);
  const [models, setModels] = useState([]);
  const defaultModel = {
    'summary': 'lIama2:13b-chat',
    'initialevaluation': 'Ilama2:70b-chat',
    'datapreparation': ''}
  const [selectedTasks, setSelectedTasks] = useState({
  summary: { checked: false, value: defaultModel.summary },
  initialevaluation: { checked: false, value: defaultModel.initialevaluation },
  datapreparation: { checked: false, value: '' }
  });


  useEffect(() => {
    const fetchModels = async () => {
        const response = await fetch("/api/v1/models");
        const data = await response.json();
        setModels(data);
    };
    fetchModels();
}, []);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCheck = (event) => {
    setSelectedTasks({
      ...selectedTasks,
      [event.target.name]: { ...selectedTasks[event.target.name], checked: event.target.checked }
    });
  };


  const handleSelectChange = (event) => {
    setSelectedTasks({
      ...selectedTasks,
      [event.target.name]: { ...selectedTasks[event.target.name], value: event.target.value }
    });
  };

  const handleConfirm = async () => {
    try{
    const tasks = Object.entries(selectedTasks)
      .filter(([key, task]) => task.checked)
      .reduce((acc, [key, task]) => ({ ...acc, [key]: task.value }), {});

    if (Object.keys(tasks).length === 0) {
      setAlert({show: true, message: "Seleccione al menos una tarea para regenerar.", variant: "warning"});
      return;
    }

    handleClose();

    const response = await fetch(`/api/v1/evaluate/reevaluate/${username}/${articleTitle}`, {
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
  <Button variant="primary" onClick={handleShow}>Generar nuevo procesamiento</Button>
  <Modal show={show} onHide={handleClose}> 
      <Modal.Header closeButton>
          <Modal.Title>Selecciona el elemento a regenerar</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {Object.keys(taskTranslations).map((task) => {
          const { checked, value } = selectedTasks[task];
          return (
            <Card key={task}>
              <Card.Body>
                <Form.Group controlId={task}>
                  <Form.Check
                    name={task}
                    type="checkbox"
                    label={translateTask(task)}
                    checked={checked}
                    onChange={handleCheck}
                  />

                  {models.length > 0 ? (
                    <Form.Control
                      as="select"
                      name={task}
                      disabled={!checked}
                      value={value}
                      onChange={handleSelectChange}
                    >
                      <option disabled value="">Seleccione un modelo</option>
                      {models.map((model, index) => <option key={index} value={model}>{model}</option>)}
                    </Form.Control>
                  ) : (
                    task !== 'datapreparation' && (
                      <Form.Control
                        plaintext
                        readOnly
                        defaultValue={`Se usara el modelo por defecto: ${defaultModel[task]}`}
                      />
                    )
                  )}
                </Form.Group>
              </Card.Body>
            </Card>
          );
        })}
        </Modal.Body>
      <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleConfirm}>Confirmar</Button>
      </Modal.Footer>
  </Modal>
</>
);
}

export default RegenerationModal;