import AuthContext  from "./context";
import { useState } from "react";

const AppProvider = (props) => {
    const [sessionToken, setSessionToken] = useState(null);
    const [role, setRole] = useState(null);
    const [username, setUsername] = useState(null);
  
    const handleSetSessionToken = (token) => {
      setSessionToken(token);
    };
  
    const handleSetRole = (role) => {
      setRole(role);
    };
  
    const handleSetUsername = (username) => {
      setUsername(username);
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
        {props.children}
      </AuthContext.Provider>
    );
  };
  
  export default AppProvider;