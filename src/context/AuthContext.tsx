// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, type ReactNode } from "react";
import { login, logout, me } from "../services/auth";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import type { User } from "../types/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loginUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Chargement initial de l'utilisateur si un token existe

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      me(token)
        .then(setUser)
        .catch(() => {
          setToken(null);
          localStorage.removeItem("token");
          delete api.defaults.headers.common["Authorization"];
        })
        .finally(() => setLoading(false));
    } else {
      delete api.defaults.headers.common["Authorization"];
      setLoading(false);
    }
  }, [token]);

  const loginUser = async (email: string, password: string) => {
    try {
      const data = await login(email, password);
      setToken(data.access_token);
      localStorage.setItem("token", data.access_token);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Navigation en fonction du rôle
      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Erreur lors de l'appel API Login:", error);
      throw error;
    }
  };


  const logoutUser = async () => {
    if (token) {
      try {
        await logout(token);
      } catch { // même si l’API échoue, on nettoie quand même 
      }
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  // (or your Auth provider file)

  const refreshUser = async () => {
    if (token) {
      try {
        const userData = await me(token);
        setUser(userData);
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser, refreshUser, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
