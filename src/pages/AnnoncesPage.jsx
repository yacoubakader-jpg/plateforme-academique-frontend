// src/pages/AnnoncesPage.jsx

import { useState, useEffect } from 'react';
import { listerAnnonces, creerAnnonce } from '../api/annonces';
import { useAuth } from '../context/AuthContext';
import Carte from '../components/Carte';
import Bouton from '../components/Bouton';
import Champ from '../components/Champ';
import ZoneTexte from '../components/ZoneTexte';
import Alerte from '../components/Alerte';
import Chargement from '../components/Chargement';

const URL_BASE_BACKEND = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');

export default function AnnoncesPage() {
  const { utilisateur } = useAuth();
  const [annonces, setAnnonces] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);

  const peutPublier = ['professeur', 'representant_entreprise', 'admin_plateforme'].includes(utilisateur.role);

  useEffect(() => {
    chargerAnnonces();
  }, []);

  function chargerAnnonces() {
    setChargement(true);
    listerAnnonces().then(setAnnonces).finally(() => setChargement(false));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Annonces</h1>
          <p className="text-gray-500 text-sm">Informations et opportunités pour la communauté</p>
        </div>
        {peutPublier && (
          <Bouton onClick={() => setFormulaireOuvert(!formulaireOuvert)}>
            {formulaireOuvert ? 'Annuler' : '+ Publier'}
          </Bouton>
        )}
      </div>

      {formulaireOuvert && (
        <FormulaireAnnonce
          role={utilisateur.role}
          onPublie={() => { setFormulaireOuvert(false); chargerAnnonces(); }}
        />
      )}

      {chargement ? (
        <Chargement />
      ) : annonces.length === 0 ? (
        <p className="text-gray-500">Aucune annonce pour l'instant.</p>
      ) : (
        <div className="space-y-4">
          {annonces.map((a) => (
            <Carte key={a.id}>
              {a.image_url && (
                <img
                  src={`${URL_BASE_BACKEND}${a.image_url}`}
                  alt={a.titre}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">{a.titre}</h2>
              <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">{a.contenu}</p>
              {a.lien_externe && (
                <a href={a.lien_externe} target="_blank" rel="noreferrer"
                  className="inline-block text-sm text-blue-600 hover:underline font-medium mb-2">
                  En savoir plus →
                </a>
              )}
              <p className="text-xs text-gray-400">
                Publié par {a.prenom_auteur} {a.nom_auteur} · {new Date(a.date_traitement || a.date_creation).toLocaleDateString('fr-FR')}
              </p>
            </Carte>
          ))}
        </div>
      )}
    </div>
  );
}

function FormulaireAnnonce({ role, onPublie }) {
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [lienExterne, setLienExterne] = useState('');
  const [image, setImage] = useState(null);
  const [ciblerEtudiants, setCiblerEtudiants] = useState(true);
  const [ciblerProfesseurs, setCiblerProfesseurs] = useState(true);
  const [ciblerEntreprises, setCiblerEntreprises] = useState(true);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [chargement, setChargement] = useState(false);

  async function gererSoumission(e) {
    e.preventDefault();
    setErreur(''); setSucces('');

    const cibles = [];
    if (ciblerEtudiants) cibles.push('etudiant');
    if (ciblerProfesseurs) cibles.push('professeur');
    if (ciblerEntreprises) cibles.push('representant_entreprise');

    if (cibles.length === 0) {
      setErreur('Sélectionnez au moins un public cible');
      return;
    }

    const rolesCibles = cibles.length === 3 ? 'tous' : cibles.join(',');

    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('contenu', contenu);
    formData.append('rolesCibles', rolesCibles);
    if (lienExterne) formData.append('lienExterne', lienExterne);
    if (image) formData.append('image', image);

    setChargement(true);
    try {
      const reponse = await creerAnnonce(formData);
      setSucces(role === 'admin_plateforme'
        ? 'Annonce publiée immédiatement.'
        : 'Annonce soumise, en attente de validation par un administrateur.');
      setTitre(''); setContenu(''); setLienExterne(''); setImage(null);
      setTimeout(() => onPublie(), 1500);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la publication');
    } finally {
      setChargement(false);
    }
  }

  return (
    <Carte className="mb-6">
      <h2 className="font-medium text-gray-900 dark:text-white mb-3">Publier une annonce</h2>

      <Alerte type="erreur" message={erreur} />
      <Alerte type="succes" message={succes} />

      <form onSubmit={gererSoumission}>
        <Champ label="Titre" value={titre} onChange={(e) => setTitre(e.target.value)} requis />
        <ZoneTexte label="Contenu" value={contenu} onChange={(e) => setContenu(e.target.value)} requis lignes={4} />
        <Champ label="Lien externe (optionnel)" type="url" value={lienExterne}
          onChange={(e) => setLienExterne(e.target.value)} placeholder="https://..." />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Image (optionnelle)</label>
          <input type="file" accept=".jpg,.jpeg,.png,.webp"
            onChange={(e) => setImage(e.target.files[0])} className="text-sm text-gray-600" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Public cible</label>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={ciblerEtudiants} onChange={(e) => setCiblerEtudiants(e.target.checked)} />
              Étudiants
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={ciblerProfesseurs} onChange={(e) => setCiblerProfesseurs(e.target.checked)} />
              Professeurs
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={ciblerEntreprises} onChange={(e) => setCiblerEntreprises(e.target.checked)} />
              Entreprises
            </label>
          </div>
        </div>

        <Bouton type="submit" disabled={chargement} className="w-full">
          {chargement ? 'Envoi...' : 'Publier'}
        </Bouton>
      </form>
    </Carte>
  );
}
