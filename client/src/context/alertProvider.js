import React, { createContext, useState, useEffect } from 'react';

const AlertContext = createContext();

const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({ show: false, variant: 'success', message: ''});

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setAlert({ show: false, variant: '', message: '' });
    }, 3000);

    // Limpiar el temporizador cuando el componente se desmonte o el estado de alert cambie
    return () => clearTimeout(timeoutId);
  }, [alert]);
  return (
    <AlertContext.Provider value={{ alert, setAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export { AlertProvider, AlertContext };
