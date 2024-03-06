import {useContext, useState, useEffect } from "react";
import AuthContext from "./context";
import { useNavigate } from "react-router-dom";


const useAuth = () => {
  return useContext(AuthContext);
};




const AppProvider = ({ children }) => {
  const [sessionToken, setSessionToken] = useState(
    localStorage.getItem("sessionToken") || null
  );
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || null
  );
  const navigate = useNavigate();


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

  const handleLogout = () => {
    
    fetch("http://localhost:5000/api/v1/logout", {
      method:'POST',
    })

    // clear context
    setSessionToken(null);
    setRole(null);
    setUsername(null);

    navigate("/")

    // clear localStorage
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
  };

  return (
    <AuthContext.Provider
      value={{
        sessionToken,
        role,
        username,
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
