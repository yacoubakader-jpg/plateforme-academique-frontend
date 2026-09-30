// src/api/domaines.js
import client from './client';

export const listerDomaines = () =>
  client.get('/domaines').then(r => r.data);
