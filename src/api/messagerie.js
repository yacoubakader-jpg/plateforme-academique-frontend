// src/api/messagerie.js
import client from './client';

// Envoie un message texte simple
export const envoyerMessageProjet = (projetId, contenu) => {
  const formData = new FormData();
  formData.append('contenu', contenu);
  return client.post(`/messagerie/projets/${projetId}`, formData).then(r => r.data);
};

export const envoyerMessageEquipe = (equipeId, contenu) => {
  const formData = new FormData();
  formData.append('contenu', contenu);
  return client.post(`/messagerie/equipes/${equipeId}`, formData).then(r => r.data);
};

// Envoie une pièce jointe (fichier classique OU enregistrement vocal)
// `fichier` est un objet File ou un Blob (pour les vocaux enregistrés)
export const envoyerFichierProjet = (projetId, fichier, dureeSecondes) => {
  const formData = new FormData();
  formData.append('pieceJointe', fichier, fichier.name || 'vocal.webm');
  if (dureeSecondes) formData.append('duree', dureeSecondes);
  return client.post(`/messagerie/projets/${projetId}`, formData).then(r => r.data);
};

export const envoyerFichierEquipe = (equipeId, fichier, dureeSecondes) => {
  const formData = new FormData();
  formData.append('pieceJointe', fichier, fichier.name || 'vocal.webm');
  if (dureeSecondes) formData.append('duree', dureeSecondes);
  return client.post(`/messagerie/equipes/${equipeId}`, formData).then(r => r.data);
};

export const listerMessagesProjet = (projetId) =>
  client.get(`/messagerie/projets/${projetId}`).then(r => r.data);

export const listerMessagesEquipe = (equipeId) =>
  client.get(`/messagerie/equipes/${equipeId}`).then(r => r.data);

export const modifierMessage = (messageId, contenu) =>
  client.patch(`/messagerie/messages/${messageId}`, { contenu }).then(r => r.data);

export const supprimerMessage = (messageId) =>
  client.delete(`/messagerie/messages/${messageId}`).then(r => r.data);
