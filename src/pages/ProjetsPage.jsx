// src/pages/ProjetsPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listerProjets } from '../api/projets';
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

export default function ProjetsPage() {
  const [projets, setProjets] = useState([]);
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
    listerProjets({ statut: 'ouvert', domaineId: domaineId || undefined, recherche: recherche || undefined, page, limite: 10 })
      .then((reponse) => {
        setProjets(reponse.donnees);
        setTotalPages(reponse.totalPages);
      })
      .finally(() => setChargement(false));
  }, [page, domaineId, recherche]);

  function gererChangementDomaine(valeur) {
    setDomaineId(valeur);
    setPage(1); // revenir à la première page quand le filtre change
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Projets étudiants</h1>
          <p className="text-gray-500 text-sm">Entraide entre étudiants</p>
        </div>
        {utilisateur?.role === 'etudiant' && (
          <Link to="/projets/nouveau">
            <Bouton>+ Créer un projet</Bouton>
          </Link>
        )}
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <BarreRecherche valeur={recherche} onChange={(v) => { setRecherche(v); setPage(1); }} placeholder="Rechercher un projet..." />
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
      ) : projets.length === 0 ? (
        <p className="text-gray-500">Aucun projet ouvert pour le moment.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projets.map((p) => (
            <Link key={p.id} to={`/projets/${p.id}`}>
              <Carte className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-medium text-gray-900 dark:text-white">{p.titre}</h2>
                  <div className="flex items-center gap-2">
                    <BoutonFavori typeContexte="projet" contexteId={p.id}
                      estFavoriInitial={idsFavoris.some(f => f.type_contexte === 'projet' && f.contexte_id === p.id)} />
                    <Badge texte={p.statut} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                  <span>{p.domaine}</span>
                  <span>·</span>
                  <span>{p.niveau}</span>
                  <span>·</span>
                  <span>{p.nom_organisation}</span>
                </div>
              </Carte>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChangerPage={setPage} />
    </div>
  );
}
