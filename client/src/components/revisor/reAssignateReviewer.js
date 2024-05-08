import React from 'react';
import { Button } from 'react-bootstrap';
import { useContext } from "react";
import AuthContext from "../../context/context";
import { useNavigate } from 'react-router-dom';

const ReassignateReviewButton = ({ username, articleTitle, setAlert }) =>  {

  const {sessionToken, logout} = useContext(AuthContext); // Accede a username y sessionToken desde el contexto
  const navigate = useNavigate();

  const reassignReviewClickHandler = async () => {
      const response = await fetch(`/api/v1/evaluate/reassignate/${username}/${encodeURIComponent(articleTitle)}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionToken}`
          }
      });

      if(response.status === 200) {
        setAlert({ visible: true, variant: 'success', message: 'Nuevo revisor asignado correctamente.' });
        navigate(-1);
      } else {
        setAlert({ visible: true, variant: 'danger', message: 'No se encontró un revisor compatibale ¡Por favor contácte con el administrador!' });
      }
                  
      if(response.status === 401) {
          logout();
          return;
        }

      setTimeout(()=> setAlert({visible: false, variant: '', message: ''}), 1500)
  };

  return (
      <Button variant="primary" onClick={reassignReviewClickHandler}>Asignar nuevo revisor</Button>
  );
};

export default ReassignateReviewButton;