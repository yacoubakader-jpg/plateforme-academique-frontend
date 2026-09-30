// src/api/notifications.js
import client from './client';

export const listerNotifications = () =>
  client.get('/notifications').then(r => r.data);

export const compterNonLues = () =>
  client.get('/notifications/non-lues/compte').then(r => r.data);

export const marquerCommeLue = (id) =>
  client.patch(`/notifications/${id}/lue`).then(r => r.data);

export const marquerToutesCommeLues = () =>
  client.patch('/notifications/tout-lire').then(r => r.data);
