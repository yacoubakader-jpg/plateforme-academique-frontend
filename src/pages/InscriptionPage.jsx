// src/pages/InscriptionPage.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { soumettreDemande } from '../api/demandes';
import { listerOrganisations } from '../api/organisations';
import Champ from '../components/Champ';
import Bouton from '../components/Bouton';
import Alerte from '../components/Alerte';
import Carte from '../components/Carte';

export default function InscriptionPage() {
  const [typeDemande, setTypeDemande] = useState('etudiant');
  const [organisations, setOrganisations] = useState([]);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [chargement, setChargement] = useState(false);
  const navigate = useNavigate();

  // Champs communs étudiant/professeur
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [organisationId, setOrganisationId] = useState('');
  const [niveau, setNiveau] = useState('L3');

  // Champs organisation
  const [nomOrganisation, setNomOrganisation] = useState('');
  const [typeOrganisation, setTypeOrganisation] = useState('universite');
  const [paysOrganisation, setPaysOrganisation] = useState('');

  const [document, setDocument] = useState(null);

  useEffect(() => {
    if (typeDemande !== 'organisation') {
      listerOrganisations().then(setOrganisations).catch(() => setOrganisations([]));
    }
  }, [typeDemande]);

  async function gererSoumission(e) {
    e.preventDefault();
    setErreur('');
    setSucces('');

    if (!document) {
      setErreur('Un document justificatif est obligatoire');
      return;
    }

    const formData = new FormData();
    formData.append('typeDemande', typeDemande);
    formData.append('email', email);
    formData.append('document', document);

    if (typeDemande === 'organisation') {
      formData.append('nomOrganisation', nomOrganisation);
      formData.append('typeOrganisation', typeOrganisation);
      formData.append('paysOrganisation', paysOrganisation);
    } else {
      formData.append('nom', nom);
      formData.append('prenom', prenom);
      formData.append('organisationId', organisationId);
      if (typeDemande === 'etudiant') {
        formData.append('niveau', niveau);
      }
    }

    setChargement(true);
    try {
      await soumettreDemande(formData);
      setSucces('Votre demande a été soumise. Vous recevrez un email une fois validée par un administrateur.');
      setTimeout(() => navigate('/connexion'), 3000);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la soumission');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <Carte className="w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Demande d'inscription</h1>
        <p className="text-gray-500 text-sm mb-6">
          Votre demande sera examinée par un administrateur avant validation.
        </p>

        <Alerte type="erreur" message={erreur} />
        <Alerte type="succes" message={succes} />

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Je m'inscris en tant que</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { valeur: 'etudiant', libelle: 'Étudiant' },
              { valeur: 'professeur', libelle: 'Professeur' },
              { valeur: 'organisation', libelle: 'Organisation' },
            ].map((option) => (
              <button
                key={option.valeur}
                type="button"
                onClick={() => setTypeDemande(option.valeur)}
                className={`px-3 py-2 rounded-lg text-sm border ${
                  typeDemande === option.valeur
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.libelle}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={gererSoumission}>
          {typeDemande === 'organisation' ? (
            <>
              <Champ label="Nom de l'organisation" value={nomOrganisation}
                onChange={(e) => setNomOrganisation(e.target.value)} requis />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'organisation *</label>
                <select
                  value={typeOrganisation}
                  onChange={(e) => setTypeOrganisation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="universite">Université</option>
                  <option value="entreprise">Entreprise</option>
                </select>
              </div>

              <Champ label="Pays" value={paysOrganisation}
                onChange={(e) => setPaysOrganisation(e.target.value)} requis />

              <Champ label="Email du contact principal" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} requis />
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Champ label="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} requis />
                <Champ label="Nom" value={nom} onChange={(e) => setNom(e.target.value)} requis />
              </div>

              <Champ label="Email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} requis />

              {typeDemande === 'etudiant' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau d'études *</label>
                  <select
                    value={niveau}
                    onChange={(e) => setNiveau(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {['L1', 'L2', 'L3', 'M1', 'M2'].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organisation <span className="text-red-500">*</span>
                </label>
                <select
                  value={organisationId}
                  onChange={(e) => setOrganisationId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner...</option>
                  {organisations.map((org) => (
                    <option key={org.id} value={org.id}>{org.nom}</option>
                  ))}
                </select>
                {organisations.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Aucune organisation trouvée — elle doit être validée avant que ses membres puissent s'inscrire.
                  </p>
                )}
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document justificatif <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal">
                {' '}({typeDemande === 'organisation' ? 'accréditation / Kbis' : 'carte étudiant ou professionnelle'}, PDF/JPG/PNG)
              </span>
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setDocument(e.target.files[0])}
              required
              className="w-full text-sm text-gray-600"
            />
          </div>

          <Bouton type="submit" disabled={chargement} className="w-full mt-2">
            {chargement ? 'Envoi en cours...' : 'Soumettre ma demande'}
          </Bouton>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ? <Link to="/connexion" className="text-blue-600 hover:underline">Se connecter</Link>
        </p>
      </Carte>
    </div>
  );
}
