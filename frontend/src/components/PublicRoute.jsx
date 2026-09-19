import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps public-only routes (login, register).
 * Redirects already-authenticated users to /dashboard.
 */
export const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};
