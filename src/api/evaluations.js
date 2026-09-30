// src/api/evaluations.js
import client from './client';

export const creerEvaluation = (donnees) =>
  client.post('/evaluations', donnees).then(r => r.data);

export const obtenirEvaluation = (soumissionId) =>
  client.get(`/evaluations/soumission/${soumissionId}`).then(r => r.data).catch(() => null);

export const listerEvaluationsParDefi = (defiId) =>
  client.get(`/evaluations/defi/${defiId}`).then(r => r.data);
