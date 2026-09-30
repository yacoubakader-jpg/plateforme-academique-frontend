// src/api/utilisateurs.js
import client from './client';

export const rechercherCandidats = (filtres = {}) =>
  client.get('/utilisateurs/recherche-candidats', { params: filtres }).then(r => r.data);
