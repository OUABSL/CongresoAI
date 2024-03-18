import React from 'react';
import { Button } from 'react-bootstrap';
import { useContext } from "react";
import AuthContext from "../../context/context";
import { useNavigate } from 'react-router-dom';

// Reassignment button component
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
        setAlert({ visible: true, variant: 'success', message: 'Reassignment done successfully.' });
        navigate(-1);
      } else {
        setAlert({ visible: true, variant: 'danger', message: 'Failed to reassign. Please contact the administrator.' });
      }
                  
      if(response.status === 401) {
          logout();
          return;
        }

      setTimeout(()=> setAlert({visible: false, variant: '', message: ''}), 1500)
  };

  return (
      <Button variant="primary" onClick={reassignReviewClickHandler}>Reassign Review</Button>
  );
};

export default ReassignateReviewButton;