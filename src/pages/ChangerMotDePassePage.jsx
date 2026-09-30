// src/pages/ChangerMotDePassePage.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changerMotDePasse } from '../api/auth';
import Champ from '../components/Champ';
import Bouton from '../components/Bouton';
import Alerte from '../components/Alerte';
import Carte from '../components/Carte';

export default function ChangerMotDePassePage() {
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const navigate = useNavigate();

  async function gererSoumission(e) {
    e.preventDefault();
    setErreur('');

    if (nouveauMotDePasse !== confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas');
      return;
    }
    if (nouveauMotDePasse.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setChargement(true);
    try {
      await changerMotDePasse(nouveauMotDePasse);
      navigate('/');
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors du changement de mot de passe');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Carte className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Nouveau mot de passe</h1>
        <p className="text-gray-500 text-sm mb-6">
          Pour votre sécurité, choisissez un mot de passe personnel avant de continuer.
        </p>

        <Alerte message={erreur} />

        <form onSubmit={gererSoumission}>
          <Champ
            label="Nouveau mot de passe"
            type="password"
            value={nouveauMotDePasse}
            onChange={(e) => setNouveauMotDePasse(e.target.value)}
            requis
          />
          <Champ
            label="Confirmer le mot de passe"
            type="password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            requis
          />
          <Bouton type="submit" disabled={chargement} className="w-full mt-2">
            {chargement ? 'Enregistrement...' : 'Valider'}
          </Bouton>
        </form>
      </Carte>
    </div>
  );
}
