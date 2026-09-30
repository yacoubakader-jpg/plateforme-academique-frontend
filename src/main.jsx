import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { enregistrerServiceWorker } from './utils/push'

// Enregistre le service worker dès le chargement, indépendamment de la
// demande de permission (qui, elle, se fait plus tard sur action de
// l'utilisateur, via la cloche de notifications).
enregistrerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
