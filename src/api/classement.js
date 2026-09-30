// src/api/classement.js
import client from './client';

export const obtenirClassement = (portee = 'universite') =>
  client.get('/classement', { params: { portee } }).then(r => r.data);
