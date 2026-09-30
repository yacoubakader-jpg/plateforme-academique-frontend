// src/api/favoris.js
import client from './client';

export const listerFavoris = () =>
  client.get('/favoris').then(r => r.data);

export const listerIdsFavoris = () =>
  client.get('/favoris/ids').then(r => r.data);

export const ajouterFavori = (typeContexte, contexteId) =>
  client.post('/favoris', { typeContexte, contexteId }).then(r => r.data);

export const retirerFavori = (typeContexte, contexteId) =>
  client.delete('/favoris', { data: { typeContexte, contexteId } }).then(r => r.data);
