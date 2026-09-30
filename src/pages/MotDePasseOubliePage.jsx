// src/pages/MotDePasseOubliePage.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motDePasseOublie } from '../api/auth';
import Champ from '../components/Champ';
import Bouton from '../components/Bouton';
import Alerte from '../components/Alerte';
import Carte from '../components/Carte';

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('');
  const [succes, setSucces] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  async function gererSoumission(e) {
    e.preventDefault();
    setErreur(''); setSucces('');
    setChargement(true);
    try {
      const reponse = await motDePasseOublie(email);
      setSucces(reponse.message);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Une erreur est survenue');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Carte className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Mot de passe oublié</h1>
        <p className="text-gray-500 text-sm mb-6">
          Indique ton email, tu recevras un lien pour choisir un nouveau mot de passe.
        </p>

        <Alerte type="erreur" message={erreur} />
        <Alerte type="succes" message={succes} />

        <form onSubmit={gererSoumission}>
          <Champ label="Email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} requis placeholder="vous@exemple.com" />
          <Bouton type="submit" disabled={chargement} className="w-full mt-2">
            {chargement ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
          </Bouton>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/connexion" className="text-blue-600 hover:underline">Retour à la connexion</Link>
        </p>
      </Carte>
    </div>
  );
}
