// src/api/defis.js
import client from './client';

export const listerDefis = (filtres = {}) =>
  client.get('/defis', { params: filtres }).then(r => r.data);

export const obtenirDefi = (id) =>
  client.get(`/defis/${id}`).then(r => r.data);

export const creerDefi = (donnees) =>
  client.post('/defis', donnees).then(r => r.data);

export const changerStatutDefi = (id, statut) =>
  client.patch(`/defis/${id}/statut`, { statut }).then(r => r.data);

export const rouvrirDefi = (id) =>
  client.patch(`/defis/${id}/rouvrir`).then(r => r.data);
