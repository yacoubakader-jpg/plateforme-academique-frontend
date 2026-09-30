// src/api/equipes.js
import client from './client';

export const creerEquipe = (defiId, nomEquipe) =>
  client.post('/equipes', { defiId, nomEquipe }).then(r => r.data);

export const obtenirEquipe = (id) =>
  client.get(`/equipes/${id}`).then(r => r.data);

export const rejoindreEquipe = (id) =>
  client.post(`/equipes/${id}/rejoindre`).then(r => r.data);

export const listerEquipesParDefi = (defiId) =>
  client.get(`/equipes/defi/${defiId}`).then(r => r.data);
