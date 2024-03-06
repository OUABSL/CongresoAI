import {useContext, useState, useEffect } from "react";
import AuthContext from "./context";

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

  return (
    <AuthContext.Provider
      value={{
        sessionToken,
        role,
        username,
        setSessionToken: handleSetSessionToken,
        setRole: handleSetRole,
        setUsername: handleSetUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, useAuth };
export default AppProvider;
