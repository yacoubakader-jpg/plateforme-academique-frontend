// src/api/organisations.js
import client from './client';

export const listerOrganisations = (type) =>
  client.get('/organisations', { params: { type } }).then(r => r.data);

export const obtenirOrganisation = (id) =>
  client.get(`/organisations/${id}`).then(r => r.data);
