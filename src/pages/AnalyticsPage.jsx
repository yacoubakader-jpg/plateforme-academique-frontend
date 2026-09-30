// src/pages/AnalyticsPage.jsx

import { useState, useEffect } from 'react';
import { statsOrganisation } from '../api/analytics';
import Carte from '../components/Carte';
import Chargement from '../components/Chargement';
import Alerte from '../components/Alerte';

function CarteChiffre({ label, valeur, couleur = 'text-gray-900 dark:text-white' }) {
  return (
    <Carte>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-semibold mt-1 ${couleur}`}>{valeur}</p>
    </Carte>
  );
}

function BarreRepartition({ titre, donnees }) {
  const total = donnees.reduce((s, d) => s + d.total, 0) || 1;
  return (
    <Carte>
      <h2 className="font-medium text-gray-900 dark:text-white mb-4">{titre}</h2>
      {donnees.length === 0 ? (
        <p className="text-sm text-gray-400">Aucune donnée pour l'instant.</p>
      ) : (
        <div className="space-y-2">
          {donnees.map((d) => (
            <div key={d.domaine}>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{d.domaine}</span>
                <span>{d.total}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(d.total / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Carte>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    statsOrganisation()
      .then(setStats)
      .catch((err) => setErreur(err.response?.data?.erreur || 'Impossible de charger les statistiques'))
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return <Chargement />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Tableau de bord</h1>
      <p className="text-gray-500 text-sm mb-6">Vue d'ensemble de l'activité de votre organisation</p>

      <Alerte message={erreur} />

      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <CarteChiffre label="Défis publiés" valeur={stats.nombreDefis} />
            <CarteChiffre label="Projets étudiants" valeur={stats.nombreProjets} />
            <CarteChiffre label="Étudiants inscrits" valeur={stats.nombreEtudiants} />
            <CarteChiffre label="Candidatures reçues" valeur={stats.nombreCandidatures} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <CarteChiffre label="🎖️ Badges de participation délivrés" valeur={stats.badgesParticipation} couleur="text-blue-600" />
            <CarteChiffre label="🏆 Badges d'excellence délivrés" valeur={stats.badgesExcellence} couleur="text-amber-600" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <BarreRepartition titre="Défis par domaine" donnees={stats.repartitionDefisParDomaine} />
            <BarreRepartition titre="Projets étudiants par domaine" donnees={stats.repartitionProjetsParDomaine} />
          </div>
        </>
      )}
    </div>
  );
}
