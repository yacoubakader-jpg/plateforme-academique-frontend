// src/pages/CreerDefiPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { creerDefi } from '../api/defis';
import { listerDomaines } from '../api/domaines';
import Champ from '../components/Champ';
import ZoneTexte from '../components/ZoneTexte';
import Bouton from '../components/Bouton';
import Alerte from '../components/Alerte';
import Carte from '../components/Carte';

export default function CreerDefiPage() {
  const [problemeAResoudre, setProblemeAResoudre] = useState('');
  const [objectifs, setObjectifs] = useState('');
  const [domaines, setDomaines] = useState([]);
  const [domaineId, setDomaineId] = useState('');
  const [dureeJours, setDureeJours] = useState(30);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [maxEtudiantsParEquipe, setMaxEtudiantsParEquipe] = useState(4);
  const [livrablesAttendus, setLivrablesAttendus] = useState('Rapport Word ou Excel détaillant la solution');
  const [datePresentation, setDatePresentation] = useState('');
  const [recompense, setRecompense] = useState('');
  const [technologiesTexte, setTechnologiesTexte] = useState('');
  const [criteres, setCriteres] = useState([{ critere: '', ponderation: '' }]);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    listerDomaines().then((liste) => {
      setDomaines(liste);
      if (liste.length > 0) setDomaineId(String(liste[0].id));
    });
  }, []);

  function ajouterCritere() {
    setCriteres([...criteres, { critere: '', ponderation: '' }]);
  }

  function modifierCritere(index, champ, valeur) {
    const copie = [...criteres];
    copie[index][champ] = valeur;
    setCriteres(copie);
  }

  function retirerCritere(index) {
    setCriteres(criteres.filter((_, i) => i !== index));
  }

  async function gererSoumission(e) {
    e.preventDefault();
    setErreur('');

    const totalPonderation = criteres.reduce((s, c) => s + Number(c.ponderation || 0), 0);
    if (criteres.length > 0 && totalPonderation !== 100) {
      setErreur(`La somme des pondérations doit faire 100% (actuellement ${totalPonderation}%)`);
      return;
    }

    setChargement(true);
    try {
      const technologies = technologiesTexte.split(',').map(t => t.trim()).filter(Boolean);
      const criteresValides = criteres
        .filter(c => c.critere && c.ponderation)
        .map(c => ({ critere: c.critere, ponderation: Number(c.ponderation) }));

      const reponse = await creerDefi({
        problemeAResoudre, objectifs, domaineId, dureeJours: Number(dureeJours),
        dateDebut, dateFin, maxEtudiantsParEquipe: Number(maxEtudiantsParEquipe),
        livrablesAttendus, datePresentation, recompense,
        technologies, criteres: criteresValides,
      });
      navigate(`/defis/${reponse.id}`);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la création du défi');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Créer un défi</h1>

      <Carte>
        <Alerte message={erreur} />

        <form onSubmit={gererSoumission}>
          <ZoneTexte label="Problème à résoudre" value={problemeAResoudre}
            onChange={(e) => setProblemeAResoudre(e.target.value)} requis />

          <ZoneTexte label="Objectifs" value={objectifs}
            onChange={(e) => setObjectifs(e.target.value)} requis />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Domaine *</label>
            <select value={domaineId} onChange={(e) => setDomaineId(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              {domaines.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Champ label="Durée (jours)" type="number" value={dureeJours}
              onChange={(e) => setDureeJours(e.target.value)} requis />
            <Champ label="Date de début" type="date" value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)} requis />
            <Champ label="Date de fin" type="date" value={dateFin}
              onChange={(e) => setDateFin(e.target.value)} requis />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Champ label="Max étudiants / équipe" type="number" min="1" value={maxEtudiantsParEquipe}
              onChange={(e) => setMaxEtudiantsParEquipe(e.target.value)} requis />
            <Champ label="Date de présentation" type="date" value={datePresentation}
              onChange={(e) => setDatePresentation(e.target.value)} requis />
          </div>

          <ZoneTexte label="Livrables attendus" value={livrablesAttendus}
            onChange={(e) => setLivrablesAttendus(e.target.value)} requis lignes={2} />

          <Champ label="Récompense (optionnel)" value={recompense}
            onChange={(e) => setRecompense(e.target.value)} placeholder="Ex: Certificat + stage" />

          <Champ label="Technologies autorisées (séparées par des virgules)"
            value={technologiesTexte} onChange={(e) => setTechnologiesTexte(e.target.value)}
            placeholder="Ex: React, Node.js, Python" />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Critères d'évaluation</label>
            {criteres.map((c, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text" placeholder="Nom du critère" value={c.critere}
                  onChange={(e) => modifierCritere(i, 'critere', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number" placeholder="%" value={c.ponderation}
                  onChange={(e) => modifierCritere(i, 'ponderation', e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button type="button" onClick={() => retirerCritere(i)}
                  className="text-red-500 px-2 text-sm">✕</button>
              </div>
            ))}
            <button type="button" onClick={ajouterCritere} className="text-sm text-blue-600 hover:underline">
              + Ajouter un critère
            </button>
          </div>

          <Bouton type="submit" disabled={chargement} className="w-full mt-2">
            {chargement ? 'Création...' : 'Publier le défi'}
          </Bouton>
        </form>
      </Carte>
    </div>
  );
}
