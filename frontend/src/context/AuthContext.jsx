import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cardiorisk_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username, password) => {
    const res = await api.login(username, password);
    setUser(res.user);
    localStorage.setItem('cardiorisk_user', JSON.stringify(res.user));
    return res;
  };

  const register = async (username, email, password) => {
    return await api.register(username, email, password);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cardiorisk_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
