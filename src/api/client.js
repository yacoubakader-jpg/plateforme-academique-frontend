// src/api/client.js
//
// Point central pour tous les appels au backend.
// Deux choses importantes sont automatisées ici :
// 1. On ajoute le token JWT à chaque requête (si l'utilisateur est connecté)
// 2. Si le serveur répond 401 (token invalide/expiré), on déconnecte
//    automatiquement l'utilisateur — évite de dupliquer cette logique
//    dans chaque page.

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const client = axios.create({ baseURL: BASE_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (reponse) => reponse,
  (erreur) => {
    if (erreur.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('utilisateur');
      window.location.href = '/connexion';
    }
    return Promise.reject(erreur);
  }
);

export default client;
