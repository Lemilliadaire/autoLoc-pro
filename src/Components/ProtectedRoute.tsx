// src/components/ProtectedRoute.tsx
import React, { type JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
  children: JSX.Element;
  requiredRole?: "user" | "admin";
}

const ProtectedRoute: React.FC<Props> = ({ children, requiredRole }) => {
  const { token, user, loading } = useAuth();

  // Afficher un spinner pendant le chargement
  if (loading) {
    return <LoadingSpinner />;
  }

  // Si pas de token, rediriger vers login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si un rôle est requis et que l'utilisateur n'a pas ce rôle
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

