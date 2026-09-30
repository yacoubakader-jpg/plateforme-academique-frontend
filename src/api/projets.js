// src/api/projets.js
import client from './client';

export const listerProjets = (filtres = {}) =>
  client.get('/projets', { params: filtres }).then(r => r.data);

export const obtenirProjet = (id) =>
  client.get(`/projets/${id}`).then(r => r.data);

export const creerProjet = (donnees) =>
  client.post('/projets', donnees).then(r => r.data);

export const rouvrirProjet = (id) =>
  client.patch(`/projets/${id}/rouvrir`).then(r => r.data);

export const candidater = (projetId, message) =>
  client.post(`/projets/${projetId}/candidatures`, { message }).then(r => r.data);

export const listerCandidatures = (projetId) =>
  client.get(`/projets/${projetId}/candidatures`).then(r => r.data);

export const traiterCandidature = (projetId, candidatureId, statut, motif) =>
  client.patch(`/projets/${projetId}/candidatures/${candidatureId}`, { statut, motif }).then(r => r.data);

export const proposerAccompagnement = (projetId, message) =>
  client.post(`/projets/${projetId}/propositions-accompagnement`, { message }).then(r => r.data);

export const listerPropositions = (projetId) =>
  client.get(`/projets/${projetId}/propositions-accompagnement`).then(r => r.data);

export const traiterProposition = (projetId, propositionId, statut, professeurId, motif) =>
  client.patch(`/projets/${projetId}/propositions-accompagnement/${propositionId}`, { statut, professeurId, motif }).then(r => r.data);
