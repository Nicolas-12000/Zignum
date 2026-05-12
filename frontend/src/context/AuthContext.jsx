import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const decodeJwt = (token) => {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    try {
      return JSON.parse(atob(padded));
    } catch (err) {
      return null;
    }
  };

  const buildUserFromToken = (token, fallback = {}) => {
    const payload = decodeJwt(token) || {};
    return {
      id: payload.sub || fallback.id || 'unknown',
      name: payload.name || fallback.name || payload.email || 'Usuario',
      email: payload.email || fallback.email || '',
      role: payload['custom:role'] || fallback.role || 'patient',
      token
    };
  };

  useEffect(() => {
    // Check local storage for existing session
    const checkSession = () => {
      const storedUser = localStorage.getItem('zignum_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    
    checkSession();
  }, []);

  const login = (userData) => {
    const normalized = userData?.token
      ? buildUserFromToken(userData.token, userData)
      : userData;
    setUser(normalized);
    localStorage.setItem('zignum_user', JSON.stringify(normalized));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zignum_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
