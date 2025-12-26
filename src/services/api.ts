// src/services/api.ts
import axios from "axios";

//
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Accept": "application/json",
  },
});

// Intercepteur pour gérer les erreurs 401
// Note: La déconnexion est gérée par AuthContext, pas ici
api.interceptors.response.use(
  response => response,
  error => {
    // On rejette simplement l'erreur pour que AuthContext puisse la gérer
    return Promise.reject(error);
  }
);

export default api;

