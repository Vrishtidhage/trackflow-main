
import { createContext } from "react";

// ✅ CREATE CONTEXT WITH SAFE DEFAULTS
export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  loading: false,
  setLoading: () => {},
});
