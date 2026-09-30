// src/utils/push.js
//
// Gère tout le cycle Web Push côté navigateur :
// 1. Enregistrement du service worker (public/sw.js)
// 2. Demande de permission à l'utilisateur
// 3. Abonnement au push manager du navigateur
// 4. Envoi de cet abonnement à notre backend pour qu'il puisse nous
//    envoyer des notifications plus tard

import { obtenirClePublique, enregistrerAbonnement, supprimerAbonnement } from '../api/push';

// Les clés VAPID arrivent en base64 "URL-safe" depuis le serveur, mais
// l'API navigateur PushManager attend un Uint8Array — conversion nécessaire.
function urlBase64VersUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function pushEstSupporte() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function enregistrerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.register('/sw.js');
}

export async function activerNotificationsPush() {
  if (!pushEstSupporte()) {
    throw new Error('Les notifications push ne sont pas supportées par ce navigateur');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permission refusée par l\'utilisateur');
  }

  const registration = await enregistrerServiceWorker();
  const clePublique = await obtenirClePublique();

  const abonnement = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64VersUint8Array(clePublique),
  });

  // On envoie l'abonnement au format attendu par le backend
  await enregistrerAbonnement(abonnement.toJSON());

  return abonnement;
}

export async function desactiverNotificationsPush() {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.getRegistration();
  const abonnement = await registration?.pushManager.getSubscription();

  if (abonnement) {
    await supprimerAbonnement(abonnement.endpoint);
    await abonnement.unsubscribe();
  }
}

export async function notificationsPushActives() {
  if (!('serviceWorker' in navigator)) return false;
  const registration = await navigator.serviceWorker.getRegistration();
  const abonnement = await registration?.pushManager.getSubscription();
  return !!abonnement;
}
