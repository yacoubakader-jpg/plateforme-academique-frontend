// src/api/demandes.js
import client from './client';

export const soumettreDemande = (formData) =>
  client.post('/demandes-inscription', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

export const listerDemandes = (statut, page = 1, limite = 10) =>
  client.get('/demandes-inscription', { params: { statut, page, limite } }).then(r => r.data);

export const approuverDemande = (id) =>
  client.patch(`/demandes-inscription/${id}/approuver`).then(r => r.data);

export const rejeterDemande = (id, motif) =>
  client.patch(`/demandes-inscription/${id}/rejeter`, { motif }).then(r => r.data);
