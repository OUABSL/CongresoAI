import React, { createContext, useState } from 'react';

const AlertContext = createContext();

const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({ show: false, variant: 'success', message: ''});

  setTimeout(()=> setAlert({visible: false, variant: '', message: ''}), 2500)


  return (
    <AlertContext.Provider value={{ alert, setAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export { AlertProvider, AlertContext }