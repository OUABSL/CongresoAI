import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Card } from 'react-bootstrap';
import { useContext } from 'react';
import { Range } from 'react-range';
import AuthContext from '../../context/context';
import { AlertContext } from '../../context/alertProvider';
import { useTranslation } from 'react-i18next';

const taskTranslations = {
  datapreparation: 'regenerationModal.datapreparation',
  summary: 'regenerationModal.summary',
  initialevaluation: 'regenerationModal.initialevaluation',
};

const translateTask = (task, t) => t(taskTranslations[task]) || task;

const modelsLlamUs = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];

function RegenerationModal({ username, articleTitle }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const { sessionToken, logout } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);
  const [models, setModels] = useState([]);
  const defaultModel = {
    summary: 'gpt-3.5-turbo',
    initialevaluation: 'gpt-3.5-turbo',
    datapreparation: '',
  };
  const [selectedTasks, setSelectedTasks] = useState({
    summary: { checked: false, value: defaultModel.summary },
    initialevaluation: { checked: false, value: defaultModel.initialevaluation },
    datapreparation: { checked: false, value: '' },
  });
  const [temperature, setTemperature] = useState({
    summary: 0.5,
    initialevaluation: 0.5,
  });

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/v1/models');
        const data = await response.json();
        setModels(Array.isArray(data) && data.length > 0 ? data : modelsLlamUs);
      } catch {
        setModels(modelsLlamUs);
      }
    };
    fetchModels();
  }, []);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCheck = (event) => {
    setSelectedTasks({
      ...selectedTasks,
      [event.target.name]: { ...selectedTasks[event.target.name], checked: event.target.checked },
    });
  };

  const handleSelectChange = (event) => {
    setSelectedTasks({
      ...selectedTasks,
      [event.target.name]: { ...selectedTasks[event.target.name], value: event.target.value },
    });
  };

  const handleTemperatureChange = (task, value) => {
    setTemperature({
      ...temperature,
      [task]: value[0],
    });
  };

  const handleConfirm = async () => {
    try {
      const tasks = Object.entries(selectedTasks)
        .filter(([_, task]) => task.checked)
        .reduce((acc, [key, task]) => ({
          ...acc,
          [key]: task.value,
          [`temperature_${key}`]: temperature[key],
        }), {});

      if (!Object.keys(tasks).length) {
        setAlert({ show: true, message: t('regenerationModal.selectTask'), variant: 'warning' });
        return;
      }

      handleClose();

      const response = await fetch(`/api/v1/evaluate/reevaluate/${username}/${articleTitle}`, {
        method: 'PUT',
        body: JSON.stringify(tasks),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (response.status === 401) {
        logout();
        setAlert({ show: true, message: t('reassignReview.sessionExpired'), variant: 'info' });
        return;
      }

      if (response.status === 500) throw new Error();

      setAlert({
        show: true,
        message: response.status === 200 ? t('regenerationModal.successMessage') : t('regenerationModal.error500'),
        variant: response.status === 200 ? 'success' : 'danger',
      });
    } catch {
      setAlert({ show: true, message: t('regenerationModal.generalError'), variant: 'danger' });
    }
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        {t('regenerationModal.buttonLabel')}
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{t('regenerationModal.title')}</Modal.Title>
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
                      label={translateTask(task, t)}
                      checked={checked}
                      onChange={handleCheck}
                    />
                    {models.length > 0 && task !== 'datapreparation' && (
                      <Form.Control
                        as="select"
                        name={task}
                        disabled={!checked}
                        value={value}
                        onChange={handleSelectChange}
                      >
                        <option value="">{t('regenerationModal.defaultModel', { model: defaultModel[task] })}</option>
                        {models.map((model, index) => (
                          <option key={index} value={model}>
                            {model}
                          </option>
                        ))}
                      </Form.Control>
                    )}
                  </Form.Group>
                  {models.length > 0 && task !== 'datapreparation' && (
                    <Form.Group controlId={`${task}-temperature`}>
                    <Form.Label>{t('regenerationModal.temperatureLabel')}</Form.Label>
                    <div style={{ position: 'relative', width: '100%', marginTop: '20px' }}>
                      <Range
                        step={0.1}
                        min={0}
                        max={1}
                        values={[temperature[task]]}
                        onChange={(value) => handleTemperatureChange(task, value)}
                        disabled={!checked}
                        renderTrack={({ props, children }) => (
                          <div
                            {...props}
                            style={{
                              ...props.style,
                              height: '6px',
                              background: '#ddd',
                              position: 'relative',
                            }}
                          >
                            {children}
                          </div>
                        )}
                        renderThumb={({ props, isDragged }) => (
                          <div
                            {...props}
                            style={{
                              ...props.style,
                              height: '20px',
                              width: '20px',
                              backgroundColor: '#007bff',
                              borderRadius: '50%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              boxShadow: isDragged ? '0 0 8px rgba(0, 123, 255, 0.8)' : 'none',
                            }}
                          >
                            <div
                              style={{
                                position: 'absolute',
                                top: '-30px',
                                color: '#007bff',
                                fontWeight: 'bold',
                                fontSize: '12px',
                                background: '#fff',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                boxShadow: '0 0 4px rgba(0,0,0,0.2)',
                              }}
                            >
                              {temperature[task].toFixed(1)}
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </Form.Group>                  
                  )}
                </Card.Body>
              </Card>
            );
          })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {t('regenerationModal.cancelButton')}
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            {t('regenerationModal.confirmButton')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default RegenerationModal;
