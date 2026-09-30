// src/components/CarrouselAnnonces.jsx
//
// S'adapte à la taille d'écran :
// - Mobile : image en haut (hauteur réduite), texte en dessous, empilés
// - Desktop (à partir de sm:) : image à gauche, texte à droite, côte à côte
// Rotation automatique toutes les 6 secondes s'il y a plusieurs annonces,
// avec des points de navigation cliquables et pause au survol.

import { useState, useEffect, useRef } from 'react';
import { listerAnnonces } from '../api/annonces';

const URL_BASE_BACKEND = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');
const INTERVALLE_ROTATION_MS = 6000;

export default function CarrouselAnnonces() {
  const [annonces, setAnnonces] = useState([]);
  const [index, setIndex] = useState(0);
  const [enPause, setEnPause] = useState(false);
  const [chargement, setChargement] = useState(true);
  const minuteurRef = useRef(null);

  useEffect(() => {
    listerAnnonces().then(setAnnonces).finally(() => setChargement(false));
  }, []);

  useEffect(() => {
    if (annonces.length <= 1 || enPause) return;
    minuteurRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % annonces.length);
    }, INTERVALLE_ROTATION_MS);
    return () => clearInterval(minuteurRef.current);
  }, [annonces.length, enPause]);

  if (chargement || annonces.length === 0) return null;

  const annonce = annonces[index];
  const urlImage = annonce.image_url ? `${URL_BASE_BACKEND}${annonce.image_url}` : null;

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6"
      onMouseEnter={() => setEnPause(true)}
      onMouseLeave={() => setEnPause(false)}
    >
      <div className="flex flex-col sm:flex-row">
        {urlImage && (
          <div className="w-full sm:w-64 shrink-0 h-40 sm:h-auto">
            <img src={urlImage} alt={annonce.titre} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-4 sm:p-6 flex-1 min-w-0">
          <p className="text-xs text-blue-600 font-medium mb-1">📢 Annonce</p>
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">{annonce.titre}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-3 sm:line-clamp-2">{annonce.contenu}</p>

          {annonce.lien_externe && (
            <a
              href={annonce.lien_externe}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm text-blue-600 hover:underline font-medium"
            >
              En savoir plus →
            </a>
          )}
        </div>
      </div>

      {annonces.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-3">
          {annonces.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Annonce ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-blue-600' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
