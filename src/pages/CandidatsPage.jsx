// src/pages/CandidatsPage.jsx

import { useState, useEffect } from 'react';
import { rechercherCandidats } from '../api/utilisateurs';
import { listerDomaines } from '../api/domaines';
import Carte from '../components/Carte';
import Chargement from '../components/Chargement';
import Alerte from '../components/Alerte';

export default function CandidatsPage() {
  const [candidats, setCandidats] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [niveau, setNiveau] = useState('');
  const [domaineId, setDomaineId] = useState('');
  const [technologie, setTechnologie] = useState('');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    listerDomaines().then(setDomaines);
  }, []);

  useEffect(() => {
    setChargement(true);
    rechercherCandidats({
      niveau: niveau || undefined,
      domaineId: domaineId || undefined,
      technologie: technologie || undefined,
    })
      .then(setCandidats)
      .catch((err) => setErreur(err.response?.data?.erreur || 'Impossible de charger les candidats'))
      .finally(() => setChargement(false));
  }, [niveau, domaineId, technologie]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Répertoire de candidats</h1>
      <p className="text-gray-500 text-sm mb-6">
        Étudiants classés par preuve de travail réalisé (badges obtenus sur des défis)
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={niveau} onChange={(e) => setNiveau(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Tous niveaux</option>
          {['L1', 'L2', 'L3', 'M1', 'M2'].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>

        <select value={domaineId} onChange={(e) => setDomaineId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Tous domaines</option>
          {domaines.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
        </select>

        <input
          type="text" placeholder="Technologie (ex: React)" value={technologie}
          onChange={(e) => setTechnologie(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <Alerte message={erreur} />

      {chargement ? (
        <Chargement />
      ) : candidats.length === 0 ? (
        <p className="text-gray-500">Aucun candidat ne correspond à ces critères.</p>
      ) : (
        <div className="space-y-3">
          {candidats.map((c) => (
            <Carte key={c.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{c.prenom} {c.nom}</p>
                <p className="text-sm text-gray-500">{c.niveau} · {c.nom_organisation}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right text-sm">
                  <p className="text-gray-700">{c.nombre_badges} badge(s)</p>
                  {c.nombre_excellence > 0 && (
                    <p className="text-amber-600">🏆 {c.nombre_excellence} excellence</p>
                  )}
                </div>
                <a href={`mailto:${c.email}`} className="text-sm text-blue-600 hover:underline">
                  Contacter
                </a>
              </div>
            </Carte>
          ))}
        </div>
      )}
    </div>
  );
}
