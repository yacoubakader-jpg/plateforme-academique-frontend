// src/pages/ReinitialiserMotDePassePage.jsx

import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { reinitialiserMotDePasse } from '../api/auth';
import Champ from '../components/Champ';
import Bouton from '../components/Bouton';
import Alerte from '../components/Alerte';
import Carte from '../components/Carte';

export default function ReinitialiserMotDePassePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [succes, setSucces] = useState('');
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
      const reponse = await reinitialiserMotDePasse(token, nouveauMotDePasse);
      setSucces(reponse.message);
      setTimeout(() => navigate('/connexion'), 2000);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Une erreur est survenue');
    } finally {
      setChargement(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Carte className="w-full max-w-md text-center">
          <p className="text-gray-600">Lien invalide — aucun token trouvé dans l'URL.</p>
          <Link to="/mot-de-passe-oublie" className="text-blue-600 hover:underline text-sm">
            Demander un nouveau lien
          </Link>
        </Carte>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Carte className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Nouveau mot de passe</h1>
        <p className="text-gray-500 text-sm mb-6">Choisis ton nouveau mot de passe.</p>

        <Alerte type="erreur" message={erreur} />
        <Alerte type="succes" message={succes} />

        <form onSubmit={gererSoumission}>
          <Champ label="Nouveau mot de passe" type="password" value={nouveauMotDePasse}
            onChange={(e) => setNouveauMotDePasse(e.target.value)} requis />
          <Champ label="Confirmer le mot de passe" type="password" value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)} requis />
          <Bouton type="submit" disabled={chargement} className="w-full mt-2">
            {chargement ? 'Enregistrement...' : 'Réinitialiser mon mot de passe'}
          </Bouton>
        </form>
      </Carte>
    </div>
  );
}
