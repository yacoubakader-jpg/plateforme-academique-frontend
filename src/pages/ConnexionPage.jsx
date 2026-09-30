// src/pages/ConnexionPage.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Champ from '../components/Champ';
import Bouton from '../components/Bouton';
import Alerte from '../components/Alerte';
import Carte from '../components/Carte';

export default function ConnexionPage() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const { seConnecter } = useAuth();
  const navigate = useNavigate();

  async function gererSoumission(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      const reponse = await seConnecter(email, motDePasse);
      if (reponse.doitChangerMotDePasse) {
        navigate('/changer-mot-de-passe');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur de connexion');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Carte className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Connexion</h1>
        <p className="text-gray-500 text-sm mb-6">Plateforme académique inter-universitaire</p>

        <Alerte message={erreur} />

        <form onSubmit={gererSoumission}>
          <Champ
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            requis
            placeholder="vous@exemple.com"
          />
          <Champ
            label="Mot de passe"
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            requis
          />
          <div className="text-right -mt-2 mb-4">
            <Link to="/mot-de-passe-oublie" className="text-xs text-blue-600 hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <Bouton type="submit" disabled={chargement} className="w-full mt-2">
            {chargement ? 'Connexion...' : 'Se connecter'}
          </Bouton>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="text-blue-600 hover:underline">
            Faire une demande d'inscription
          </Link>
        </p>
      </Carte>
    </div>
  );
}
