// src/pages/CreerProjetPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { creerProjet } from '../api/projets';
import { listerDomaines } from '../api/domaines';
import Champ from '../components/Champ';
import ZoneTexte from '../components/ZoneTexte';
import Bouton from '../components/Bouton';
import Alerte from '../components/Alerte';
import Carte from '../components/Carte';

export default function CreerProjetPage() {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [domaines, setDomaines] = useState([]);
  const [domaineId, setDomaineId] = useState('');
  const [nombreParticipants, setNombreParticipants] = useState(2);
  const [duree, setDuree] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [niveau, setNiveau] = useState('L3');
  const [livrablesAttendus, setLivrablesAttendus] = useState('');
  const [competencesTexte, setCompetencesTexte] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    listerDomaines().then((liste) => {
      setDomaines(liste);
      if (liste.length > 0) setDomaineId(String(liste[0].id));
    });
  }, []);

  async function gererSoumission(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      const competences = competencesTexte.split(',').map(c => c.trim()).filter(Boolean);
      const nomDomaine = domaines.find(d => String(d.id) === domaineId)?.nom || 'Autre';
      const reponse = await creerProjet({
        titre, description, domaine: nomDomaine, domaineId, nombreParticipants: Number(nombreParticipants),
        duree, dateFin: dateFin || undefined, niveau, livrablesAttendus, competences,
      });
      navigate(`/projets/${reponse.id}`);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la création du projet');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Créer un projet</h1>

      <Carte>
        <Alerte message={erreur} />

        <form onSubmit={gererSoumission}>
          <Champ label="Titre du projet" value={titre} onChange={(e) => setTitre(e.target.value)} requis />

          <ZoneTexte label="Description" value={description} onChange={(e) => setDescription(e.target.value)} requis />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Domaine *</label>
              <select value={domaineId} onChange={(e) => setDomaineId(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                {domaines.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau *</label>
              <select value={niveau} onChange={(e) => setNiveau(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                {['L1', 'L2', 'L3', 'M1', 'M2'].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Champ label="Nombre de participants recherchés" type="number" min="1"
              value={nombreParticipants} onChange={(e) => setNombreParticipants(e.target.value)} requis />
            <Champ label="Durée estimée" value={duree} onChange={(e) => setDuree(e.target.value)}
              placeholder="Ex: 2 mois" requis />
          </div>

          <Champ label="Date de fin (optionnel — clôture automatique à cette date)" type="date"
            value={dateFin} onChange={(e) => setDateFin(e.target.value)} />

          <ZoneTexte label="Livrables attendus" value={livrablesAttendus}
            onChange={(e) => setLivrablesAttendus(e.target.value)} requis lignes={2} />

          <Champ label="Compétences recherchées (séparées par des virgules)"
            value={competencesTexte} onChange={(e) => setCompetencesTexte(e.target.value)}
            placeholder="Ex: React, Node.js, Design UI" />

          <Bouton type="submit" disabled={chargement} className="w-full mt-2">
            {chargement ? 'Création...' : 'Publier le projet'}
          </Bouton>
        </form>
      </Carte>
    </div>
  );
}
