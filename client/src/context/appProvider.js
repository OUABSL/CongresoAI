import {useContext, useState, useEffect, useCallback } from "react";
import AuthContext from "./context";
import { useNavigate } from "react-router-dom";



const useAuth = () => {
  return useContext(AuthContext);
};




const AppProvider = ({ children }) => {
  const [sessionToken, setSessionToken] = useState(
    localStorage.getItem("sessionToken") || ""
  );
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );

  const navigate = useNavigate();


  const clearSession = useCallback(() => {
    navigate('/');
    setSessionToken("");
    setRole("");
    setUsername("");
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
}, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/logout", { method: 'POST' });
      // Manejo del error de red.
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`/api/v1/check-session/${username}`, {
          headers: {
            'Authorization': 'Bearer ' + sessionToken,
          },
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data = await response.json();
    
        if (data.valid) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          if (sessionToken && username && role) {
            clearSession();
          }
        }
    
      } catch (error) {
        console.error(error);
        setIsLoggedIn(false);
        if (sessionToken && username && role) {
          clearSession();
        }
      }
    };
  }, [sessionToken, username, role, clearSession]);
  
  useEffect(() => {
      if(sessionToken!=="" && role!=="" && username!==""){
        localStorage.setItem("sessionToken", sessionToken);
        localStorage.setItem("role", role);
        localStorage.setItem("username", username);
      }
  }, [sessionToken, role, username]);

  const handleSetSessionToken = (token) => {
    setSessionToken(token);
  };

  const handleSetRole = (newRole) => {
    setRole(newRole);
  };

  const handleSetUsername = (newUsername) => {
    setUsername(newUsername);
  };

  return (
    <AuthContext.Provider
      value={{
        sessionToken,
        role,
        username,
        isLoggedIn,
        setSessionToken: handleSetSessionToken,
        setRole: handleSetRole,
        setUsername: handleSetUsername,
        logout: handleLogout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, useAuth };
export default AppProvider;
