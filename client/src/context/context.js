import { createContext } from 'react';

const AuthContext = createContext({
  sessionToken: "",
  role: "",
  username: "",
  setSessionToken: () => {},
  setRole: () => {},
  setUsername: () => {},
});

export default AuthContext;