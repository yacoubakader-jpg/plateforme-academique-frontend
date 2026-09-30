// public/sw.js
//
// Service worker : tourne en arrière-plan, indépendamment de l'onglet
// ouvert. C'est lui qui reçoit les notifications push envoyées par le
// serveur (même app fermée) et qui affiche la notification système.
//
// Fichier JS "brut" (pas de build/bundle) : il doit rester à la racine
// du site pour avoir le droit de contrôler toute l'application (portée
// du service worker = son propre dossier et en-dessous).

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const donnees = event.data.json(); // { title, body, url }

  const options = {
    body: donnees.body,
    icon: '/icone-192.png',
    badge: '/icone-192.png',
    data: { url: donnees.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(donnees.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((listeClients) => {
      // Si l'app est déjà ouverte dans un onglet, on le réutilise plutôt
      // que d'en ouvrir un nouveau
      for (const client of listeClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
