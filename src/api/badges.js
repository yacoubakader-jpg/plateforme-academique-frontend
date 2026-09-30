// src/api/badges.js
import client from './client';

export const mesBadges = () =>
  client.get('/badges/moi').then(r => r.data);

// Le certificat est une route protégée par JWT : on ne peut pas faire un
// simple <a href=...>, car le navigateur n'ajouterait pas le token.
// On télécharge donc le PDF via notre client authentifié (axios), puis on
// crée une URL locale temporaire (blob) pour l'ouvrir dans un nouvel onglet.
export const ouvrirCertificat = async (badgeId) => {
  const reponse = await client.get(`/badges/${badgeId}/certificat`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(reponse.data);
  window.open(url, '_blank');
  // Libère la mémoire après un court délai (le temps que l'onglet charge le PDF)
  setTimeout(() => window.URL.revokeObjectURL(url), 10000);
};
