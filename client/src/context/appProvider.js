import {useContext, useState, useEffect, useCallback } from "react";
import AuthContext from "./context";
import { useNavigate } from "react-router-dom";

const INACTIVITY_TIMEOUT = 1000 * 60 * 20; // 20 minutes in milliseconds


const useAuth = () => {
  return useContext(AuthContext);
};




const AppProvider = ({ children }) => {
  const [sessionToken, setSessionToken] = useState(
    localStorage.getItem("sessionToken") || null
  );
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [username, setUsername] = useState(
    localStorage.getItem("username") || null
  );
  const [lastActivity, setLastActivity] = useState(Date.now());

  const navigate = useNavigate();


  const clearSession = useCallback(() => {
    navigate('/');
    setSessionToken(null);
    setRole(null);
    setUsername(null);
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
    localStorage.setItem("sessionToken", sessionToken);
    localStorage.setItem("role", role);
    localStorage.setItem("username", username);
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


  useEffect(() => {
    const handleWindowFocus = () => {
      setLastActivity(Date.now());
    };

    const handleUserInteraction = () => {
      setLastActivity(Date.now());
    };

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, []); // Empty dependency array to prevent infinite loops

  useEffect(() => {
    const timeout = setTimeout(() => {
      const now = Date.now();
      const isInactive = now - lastActivity > INACTIVITY_TIMEOUT;

      if (isInactive) {
        handleLogout();
      }
    }, INACTIVITY_TIMEOUT);

    return () => clearTimeout(timeout);
  }, [lastActivity, handleLogout]); // Dependency on `lastActivity` to restart timeout on updates


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
