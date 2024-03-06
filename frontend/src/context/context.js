import { createContext } from 'react';

const AuthContext = createContext({
  sessionToken: null,
  role: null,
  username: null,
  setSessionToken: () => {},
  setRole: () => {},
  setUsername: () => {},
});

export default AuthContext;