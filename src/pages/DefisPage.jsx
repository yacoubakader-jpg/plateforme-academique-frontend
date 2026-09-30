// src/pages/DefisPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listerDefis } from '../api/defis';
import { listerDomaines } from '../api/domaines';
import { useAuth } from '../context/AuthContext';
import Carte from '../components/Carte';
import Badge from '../components/Badge';
import Bouton from '../components/Bouton';
import Chargement from '../components/Chargement';
import Pagination from '../components/Pagination';
import BarreRecherche from '../components/BarreRecherche';
import BoutonFavori from '../components/BoutonFavori';
import { listerIdsFavoris } from '../api/favoris';

export default function DefisPage() {
  const [defis, setDefis] = useState([]);
  const [domaines, setDomaines] = useState([]);
  const [domaineId, setDomaineId] = useState('');
  const [recherche, setRecherche] = useState('');
  const [idsFavoris, setIdsFavoris] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [chargement, setChargement] = useState(true);
  const { utilisateur } = useAuth();

  useEffect(() => {
    listerDomaines().then(setDomaines);
    listerIdsFavoris().then(setIdsFavoris);
  }, []);

  useEffect(() => {
    setChargement(true);
    listerDefis({ domaineId: domaineId || undefined, recherche: recherche || undefined, page, limite: 10 })
      .then((reponse) => {
        setDefis(reponse.donnees);
        setTotalPages(reponse.totalPages);
      })
      .finally(() => setChargement(false));
  }, [page, domaineId, recherche]);

  function gererChangementDomaine(valeur) {
    setDomaineId(valeur);
    setPage(1);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Défis</h1>
          <p className="text-gray-500 text-sm">Compétitions inter-universités </p>
        </div>
        {['professeur', 'representant_entreprise'].includes(utilisateur?.role) && (
          <Link to="/defis/nouveau">
            <Bouton>+ Créer un défi</Bouton>
          </Link>
        )}
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <BarreRecherche valeur={recherche} onChange={(v) => { setRecherche(v); setPage(1); }} placeholder="Rechercher un défi..." />
        <select
          value={domaineId}
          onChange={(e) => gererChangementDomaine(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
        >
          <option value="">Tous les domaines</option>
          {domaines.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
        </select>
      </div>

      {chargement ? (
        <Chargement />
      ) : defis.length === 0 ? (
        <p className="text-gray-500">Aucun défi pour le moment.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {defis.map((d) => (
            <Link key={d.id} to={`/defis/${d.id}`}>
              <Carte className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-medium text-gray-900 dark:text-white line-clamp-1">{d.probleme_a_resoudre}</h2>
                  <div className="flex items-center gap-2 shrink-0">
                    <BoutonFavori typeContexte="defi" contexteId={d.id}
                      estFavoriInitial={idsFavoris.some(f => f.type_contexte === 'defi' && f.contexte_id === d.id)} />
                    <Badge texte={d.statut} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{d.objectifs}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                  {d.nom_domaine && <><span>{d.nom_domaine}</span><span>·</span></>}
                  <span>{d.nom_organisation}</span>
                  <span>·</span>
                  <span>Max {d.max_etudiants_par_equipe} étudiants/équipe</span>
                  <span>·</span>
                  <span>Présentation : {new Date(d.date_presentation).toLocaleDateString('fr-FR')}</span>
                </div>
                {d.recompense && (
                  <p className="text-xs text-amber-600 mt-2">🏆 {d.recompense}</p>
                )}
              </Carte>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChangerPage={setPage} />
    </div>
  );
}
