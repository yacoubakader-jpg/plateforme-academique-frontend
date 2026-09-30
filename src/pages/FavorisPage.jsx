// src/pages/FavorisPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listerFavoris } from '../api/favoris';
import Carte from '../components/Carte';
import Badge from '../components/Badge';
import Chargement from '../components/Chargement';

export default function FavorisPage() {
  const [favoris, setFavoris] = useState({ projets: [], defis: [] });
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    listerFavoris().then(setFavoris).finally(() => setChargement(false));
  }, []);

  if (chargement) return <Chargement />;

  const aucunFavori = favoris.projets.length === 0 && favoris.defis.length === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Mes favoris</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Projets et défis que vous avez sauvegardés</p>

      {aucunFavori ? (
        <p className="text-gray-500 dark:text-gray-400">
          Aucun favori pour l'instant — cliquez sur l'étoile ☆ d'un projet ou d'un défi pour le retrouver ici.
        </p>
      ) : (
        <>
          {favoris.projets.length > 0 && (
            <div className="mb-8">
              <h2 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Projets ({favoris.projets.length})</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {favoris.projets.map((p) => (
                  <Link key={p.id} to={`/projets/${p.id}`}>
                    <Carte className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">{p.titre}</h3>
                        <Badge texte={p.statut} />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{p.description}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{p.nom_organisation}</p>
                    </Carte>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {favoris.defis.length > 0 && (
            <div>
              <h2 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Défis ({favoris.defis.length})</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {favoris.defis.map((d) => (
                  <Link key={d.id} to={`/defis/${d.id}`}>
                    <Carte className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">{d.probleme_a_resoudre}</h3>
                        <Badge texte={d.statut} />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{d.objectifs}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{d.nom_organisation}</p>
                    </Carte>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
