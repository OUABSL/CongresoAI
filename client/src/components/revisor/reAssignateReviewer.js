import React from 'react';
import { Button } from 'react-bootstrap';
import { useContext } from "react";
import AuthContext from "../../context/context";
import { useNavigate } from 'react-router-dom';
import { AlertContext } from '../../context/alertProvider';



const ReassignateReviewButton = ({ username, articleTitle }) =>  {

  const {sessionToken, logout} = useContext(AuthContext); // Accede a username y sessionToken desde el contexto
  const navigate = useNavigate();
  const {setAlert } = useContext(AlertContext);


  const reassignReviewClickHandler = async () => {
      console.log(articleTitle);
      const response = await fetch(`/api/v1/evaluate/reassignate/${username}/${articleTitle}`, {
          method: 'PUT',
          body: JSON.stringify({}),
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionToken}`
          }
      });

      if(response.status === 401) {
        logout();
        setAlert({ show: true, variant: 'danger', message: 'Sesión abortada. Por favor incia sesión de nuevo!' });
        return;
      } 
  
      if(response.status === 406) {
        setAlert({ show: true, variant: 'danger', message: 'No se encontró un revisor compatibale ¡Por favor contácte con el administrador!' });
        return;
      } 
    
      if(response.status === 200) {
        setAlert({ show: true, variant: 'success', message: 'Nuevo revisor asignado correctamente.' });
        navigate(-1);
      } 
      else {
        setAlert({ show: true, variant: 'danger', message: 'Ha sucecido un error ¡Por favor contácte con el administrador!' });
      }

  };

  return (
      <Button variant="primary" onClick={reassignReviewClickHandler}>Asignar nuevo revisor</Button>
  );
};

export default ReassignateReviewButton;