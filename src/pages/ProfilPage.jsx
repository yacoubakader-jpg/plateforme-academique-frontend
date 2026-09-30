// src/pages/ProfilPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { monProfil, modifierProfil } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import Carte from '../components/Carte';
import Bouton from '../components/Bouton';
import ZoneTexte from '../components/ZoneTexte';
import Alerte from '../components/Alerte';
import Chargement from '../components/Chargement';

const URL_BASE_BACKEND = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');

export default function ProfilPage() {
  const { utilisateur } = useAuth();
  const [profil, setProfil] = useState(null);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [apercu, setApercu] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  useEffect(() => {
    monProfil().then((data) => { setProfil(data); setBio(data.bio || ''); }).finally(() => setChargement(false));
  }, []);

  function gererChoixAvatar(e) {
    const fichier = e.target.files[0];
    if (fichier) {
      setAvatar(fichier);
      setApercu(URL.createObjectURL(fichier));
    }
  }

  async function gererSoumission(e) {
    e.preventDefault();
    setErreur(''); setSucces('');

    const formData = new FormData();
    formData.append('bio', bio);
    if (avatar) formData.append('avatar', avatar);

    setEnregistrement(true);
    try {
      const miseAJour = await modifierProfil(formData);
      setProfil(miseAJour);
      setSucces('Profil mis à jour.');
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la mise à jour du profil');
    } finally {
      setEnregistrement(false);
    }
  }

  if (chargement) return <Chargement />;

  const urlAvatarActuel = apercu || (profil.avatar_url ? `${URL_BASE_BACKEND}${profil.avatar_url}` : null);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Mon profil</h1>

      <Carte>
        <Alerte type="erreur" message={erreur} />
        <Alerte type="succes" message={succes} />

        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center text-2xl text-gray-500 shrink-0">
            {urlAvatarActuel
              ? <img src={urlAvatarActuel} alt="Avatar" className="w-full h-full object-cover" />
              : profil.prenom?.[0]}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{profil.prenom} {profil.nom}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profil.email}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">{profil.role.replace(/_/g, ' ')}{profil.niveau ? ` · ${profil.niveau}` : ''}</p>
          </div>
        </div>

        <form onSubmit={gererSoumission}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo de profil</label>
            <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={gererChoixAvatar} className="text-sm text-gray-600 dark:text-gray-300" />
          </div>

          <ZoneTexte label="Bio" value={bio} onChange={(e) => setBio(e.target.value)}
            placeholder="Parlez un peu de vous..." lignes={4} />

          <Bouton type="submit" disabled={enregistrement} className="w-full mt-2">
            {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
          </Bouton>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          <Link to="/changer-mot-de-passe" className="text-blue-600 dark:text-blue-400 hover:underline">
            Changer mon mot de passe
          </Link>
        </p>
      </Carte>
    </div>
  );
}
