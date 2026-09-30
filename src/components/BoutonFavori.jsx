// src/components/BoutonFavori.jsx
//
// Étoile cliquable, réutilisée sur les cartes et pages de détail
// de projets/défis. Empêche la propagation du clic pour ne pas
// déclencher la navigation quand le composant est dans un <Link>.

import { useState } from 'react';
import { ajouterFavori, retirerFavori } from '../api/favoris';

export default function BoutonFavori({ typeContexte, contexteId, estFavoriInitial, className = '' }) {
  const [estFavori, setEstFavori] = useState(estFavoriInitial);
  const [enCours, setEnCours] = useState(false);

  async function gererClic(e) {
    e.preventDefault();
    e.stopPropagation();
    if (enCours) return;

    setEnCours(true);
    try {
      if (estFavori) {
        await retirerFavori(typeContexte, contexteId);
      } else {
        await ajouterFavori(typeContexte, contexteId);
      }
      setEstFavori(!estFavori);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <button
      onClick={gererClic}
      disabled={enCours}
      title={estFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={`text-lg leading-none ${estFavori ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600 hover:text-amber-300'} ${className}`}
    >
      {estFavori ? '★' : '☆'}
    </button>
  );
}
