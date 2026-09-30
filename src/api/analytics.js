// src/api/analytics.js
import client from './client';

export const statsOrganisation = () =>
  client.get('/analytics/organisation').then(r => r.data);
