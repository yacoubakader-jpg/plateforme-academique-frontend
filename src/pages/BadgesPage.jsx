// src/pages/BadgesPage.jsx

import { useState, useEffect } from 'react';
import { mesBadges, ouvrirCertificat } from '../api/badges';
import Carte from '../components/Carte';
import Chargement from '../components/Chargement';
import { FaLinkedin, FaFacebook, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaLink } from "react-icons/fa";

// Les nouvelles routes publiques de certificat sont montées à la racine
// du backend (pas sous /api), donc on retire "/api" de l'URL de base.
const URL_BASE_BACKEND = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');

function urlPubliqueCertificat(badgeId) {
  return `${URL_BASE_BACKEND}/certificats/${badgeId}`;
}

export default function BadgesPage() {
  const [badges, setBadges] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [enCoursTelechargement, setEnCoursTelechargement] = useState(null);
  const [lienCopie, setLienCopie] = useState(null);

  useEffect(() => {
    mesBadges().then(setBadges).finally(() => setChargement(false));
  }, []);

  async function gererTelechargement(badgeId) {
    setEnCoursTelechargement(badgeId);
    try {
      await ouvrirCertificat(badgeId);
    } catch (err) {
      alert('Impossible de générer le certificat pour le moment');
    } finally {
      setEnCoursTelechargement(null);
    }
  }

  function partager(reseau, badgeId) {
    const url = encodeURIComponent(urlPubliqueCertificat(badgeId));
    const texte = encodeURIComponent('Je viens d\'obtenir un badge sur la Plateforme Académique !');

    const urlsPartage = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${texte}`,
      whatsapp: `https://wa.me/?text=${texte}%20${url}`,
    };

    window.open(urlsPartage[reseau], '_blank', 'width=600,height=500');
  }

  async function copierLien(badgeId) {
    await navigator.clipboard.writeText(urlPubliqueCertificat(badgeId));
    setLienCopie(badgeId);
    setTimeout(() => setLienCopie(null), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Mes badges</h1>
      <p className="text-gray-500 text-sm mb-6">Votre CV de compétitions académiques</p>

      {chargement ? (
        <Chargement />
      ) : badges.length === 0 ? (
        <p className="text-gray-500">Aucun badge pour l'instant — participez à un défi pour en gagner !</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {badges.map((b) => (
            <Carte key={b.id} className={b.type === 'excellence' ? 'border-amber-300 bg-amber-50' : ''}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{b.type === 'excellence' ? '🏆' : '🎖️'}</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">{b.type}</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{b.probleme_a_resoudre}</p>
              <p className="text-xs text-gray-400 mt-2">
                {b.nom_organisation} · {new Date(b.date_delivrance).toLocaleDateString('fr-FR')}
              </p>

              <button
                onClick={() => gererTelechargement(b.id)}
                disabled={enCoursTelechargement === b.id}
                className="mt-3 text-sm text-blue-600 hover:underline disabled:opacity-50 block"
              >
                {enCoursTelechargement === b.id ? 'Génération...' : '📄 Télécharger / Imprimer'}
              </button>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">Partager :</span>
                <button onClick={() => partager('linkedin', b.id)} title="LinkedIn"
                  className="text-sm hover:opacity-70"><FaLinkedin /></button>
                <button onClick={() => partager('facebook', b.id)} title="Facebook"
                  className="text-sm hover:opacity-70"><FaFacebook /></button>
                <button onClick={() => partager('twitter', b.id)} title="X / Twitter"
                  className="text-sm hover:opacity-70"><FaXTwitter /></button>
                <button onClick={() => partager('whatsapp', b.id)} title="WhatsApp"
                  className="text-sm hover:opacity-70"><FaWhatsapp /></button>
                <button onClick={() => copierLien(b.id)} title="Copier le lien"
                  className="text-xs text-gray-500 hover:underline ml-auto">
                  {lienCopie === b.id ? '✓ Copié !' : '🔗 Copier le lien'}
                </button>
              </div>
            </Carte>
          ))}
        </div>
      )}
    </div>
  );
}
