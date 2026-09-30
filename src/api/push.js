// src/api/push.js
import client from './client';

export const obtenirClePublique = () =>
  client.get('/push/cle-publique').then(r => r.data.clePublique);

export const enregistrerAbonnement = (souscription) =>
  client.post('/push/abonnement', souscription).then(r => r.data);

export const supprimerAbonnement = (endpoint) =>
  client.delete('/push/abonnement', { data: { endpoint } }).then(r => r.data);
