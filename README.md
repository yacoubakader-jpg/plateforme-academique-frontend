# Frontend — Plateforme Académique Inter-Universitaire

React + Vite + Tailwind CSS v4, consommant l'API backend.

## Démarrage

```bash
npm install
cp .env.example .env    # adapte VITE_API_URL si besoin
npm run dev
```

→ http://localhost:5173 (le backend doit tourner sur http://localhost:3000)

## Structure

```
src/
├── api/           → un fichier par module métier (miroir des services backend)
│   └── client.js  → instance axios centrale (token JWT automatique)
├── context/
│   └── AuthContext.jsx → état de connexion global (utilisateur, login, logout)
├── components/    → composants réutilisables (Bouton, Carte, Champ, Badge...)
└── pages/         → une page par route
    ├── admin/     → pages réservées à l'admin_plateforme
```

## Comptes de test

Utilise le compte admin créé via `node creer-admin.js` côté backend pour
te connecter, valider une organisation, puis un étudiant/professeur —
exactement le parcours du script `test-parcours-complet.js` backend,
mais cette fois dans l'interface.

## Prochaines étapes suggérées

- Pagination sur les listes de projets/défis
- Page de profil éditable
- Notifications (nouvelle candidature, évaluation reçue...)
- Affichage/téléchargement du certificat PDF une fois généré côté backend
