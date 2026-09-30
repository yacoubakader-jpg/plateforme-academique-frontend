// src/api/soumissions.js
import client from './client';

export const deposerSoumission = (equipeId, defiId, fichier) => {
  const formData = new FormData();
  formData.append('equipeId', equipeId);
  formData.append('defiId', defiId);
  formData.append('rapport', fichier);
  return client.post('/soumissions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

export const listerSoumissionsParDefi = (defiId) =>
  client.get(`/soumissions/defi/${defiId}`).then(r => r.data);
