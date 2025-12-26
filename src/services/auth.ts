import api from "./api";
import type { User, AuthResponse } from "../types/api";

// On exporte les types pour pouvoir les utiliser ailleurs si besoin, mais la source de vérité reste api.ts
export type { User, AuthResponse };

// REGISTER
export const register = async (name: string, lastname: string, telephone: string, email: string, password: string, password_confirm: string, role: string = "user") => {
  const res = await api.post<AuthResponse>("/register", { name, lastname, telephone, email, password, password_confirm, role });
  return res.data;
};

// LOGIN
export const login = async (email: string, password: string) => {
  const res = await api.post<AuthResponse>("/login", { email, password });
  return res.data;
};

// LOGOUT
export const logout = async (token: string) => {
  const res = await api.post<{ status: boolean; message: string }>("/logout", {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// ME
export const me = async (token: string) => {
  const res = await api.get<User>("/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// FORGOT PASSWORD
export const forgotPassword = async (email: string) => {
  const res = await api.post<{ status: boolean; message: string }>("/forgot-password", { email });
  return res.data;
};

// RESET PASSWORD
export const resetPassword = async (token: string, password: string, password_confirmation: string) => {
  const res = await api.post<{ status: boolean; message: string }>("/reset-password", {
    token,
    password,
    password_confirmation
  });
  return res.data;
};
