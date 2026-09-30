// src/api/auth.js
import client from './client';

export const connexion = (email, motDePasse) =>
  client.post('/auth/connexion', { email, motDePasse }).then(r => r.data);

export const changerMotDePasse = (nouveauMotDePasse) =>
  client.post('/auth/changer-mot-de-passe', { nouveauMotDePasse }).then(r => r.data);

export const monProfil = () =>
  client.get('/auth/moi').then(r => r.data);

export const modifierProfil = (formData) =>
  client.patch('/auth/profil', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

export const motDePasseOublie = (email) =>
  client.post('/auth/mot-de-passe-oublie', { email }).then(r => r.data);

export const reinitialiserMotDePasse = (token, nouveauMotDePasse) =>
  client.post('/auth/reinitialiser-mot-de-passe', { token, nouveauMotDePasse }).then(r => r.data);
