import React, { createContext, useState } from 'react';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Add Alert
  const setAlert = (msg, type, timeout = 5000) => {
    const id = Math.random().toString();
    setAlerts(prev => [...prev, { msg, type, id }]);

    // Remove alert after timeout
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, timeout);
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        setAlert
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;