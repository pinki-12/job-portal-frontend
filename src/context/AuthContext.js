import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe } from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await getMe();
      setUser(data);
    } catch {
      sessionStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const loginUser = (token, userData) => {
    sessionStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await getMe();
      setUser(data);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
