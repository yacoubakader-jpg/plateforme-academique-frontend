// src/api/annonces.js
import client from './client';

export const listerAnnonces = () =>
  client.get('/annonces').then(r => r.data);

export const listerAnnoncesAdmin = (statut, page = 1, limite = 10) =>
  client.get('/annonces/admin', { params: { statut, page, limite } }).then(r => r.data);

export const creerAnnonce = (formData) =>
  client.post('/annonces', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

export const approuverAnnonce = (id) =>
  client.patch(`/annonces/${id}/approuver`).then(r => r.data);

export const rejeterAnnonce = (id, motif) =>
  client.patch(`/annonces/${id}/rejeter`, { motif }).then(r => r.data);

export const supprimerAnnonce = (id) =>
  client.delete(`/annonces/${id}`).then(r => r.data);
