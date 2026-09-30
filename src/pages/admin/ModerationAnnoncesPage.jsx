// src/pages/admin/ModerationAnnoncesPage.jsx

import { useState, useEffect } from 'react';
import { listerAnnoncesAdmin, approuverAnnonce, rejeterAnnonce, supprimerAnnonce } from '../../api/annonces';
import Carte from '../../components/Carte';
import Bouton from '../../components/Bouton';
import Badge from '../../components/Badge';
import Chargement from '../../components/Chargement';
import Alerte from '../../components/Alerte';
import Pagination from '../../components/Pagination';

const URL_BASE_BACKEND = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');

export default function ModerationAnnoncesPage() {
  const [annonces, setAnnonces] = useState([]);
  const [filtre, setFiltre] = useState('en_attente');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [motifRejet, setMotifRejet] = useState({});

  useEffect(() => { setPage(1); }, [filtre]);
  useEffect(() => { chargerAnnonces(); }, [filtre, page]);

  async function chargerAnnonces() {
    setChargement(true);
    try {
      const reponse = await listerAnnoncesAdmin(filtre, page, 10);
      setAnnonces(reponse.donnees);
      setTotalPages(reponse.totalPages);
    } catch (err) {
      setErreur('Impossible de charger les annonces');
    } finally {
      setChargement(false);
    }
  }

  async function gererApprobation(id) {
    await approuverAnnonce(id);
    chargerAnnonces();
  }

  async function gererRejet(id) {
    await rejeterAnnonce(id, motifRejet[id] || 'Non précisé');
    chargerAnnonces();
  }

  async function gererSuppression(id) {
    if (!confirm('Retirer définitivement cette annonce ?')) return;
    await supprimerAnnonce(id);
    chargerAnnonces();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Modération des annonces</h1>

      <Alerte message={erreur} />

      <div className="flex gap-2 mb-6">
        {['en_attente', 'approuvee', 'rejetee'].map((s) => (
          <button key={s} onClick={() => setFiltre(s)}
            className={`px-3 py-1.5 rounded-lg text-sm ${filtre === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {chargement ? (
        <Chargement />
      ) : annonces.length === 0 ? (
        <p className="text-gray-500">Aucune annonce dans cette catégorie.</p>
      ) : (
        <div className="space-y-4">
          {annonces.map((a) => (
            <Carte key={a.id}>
              <div className="flex gap-4">
                {a.image_url && (
                  <img src={`${URL_BASE_BACKEND}${a.image_url}`} alt={a.titre}
                    className="w-24 h-24 object-cover rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-gray-900 dark:text-white">{a.titre}</p>
                    <Badge texte={a.statut} />
                  </div>
                  <p className="text-sm text-gray-500 mb-1 line-clamp-2">{a.contenu}</p>
                  <p className="text-xs text-gray-400">
                    Par {a.prenom_auteur} {a.nom_auteur} · Cible : {a.roles_cibles}
                  </p>
                  {a.lien_externe && (
                    <a href={a.lien_externe} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                      Voir le lien
                    </a>
                  )}
                </div>
              </div>

              {a.statut === 'en_attente' && (
                <div className="flex items-center gap-2 mt-4">
                  <Bouton variante="succes" onClick={() => gererApprobation(a.id)}>Approuver</Bouton>
                  <input type="text" placeholder="Motif de rejet (optionnel)"
                    value={motifRejet[a.id] || ''}
                    onChange={(e) => setMotifRejet({ ...motifRejet, [a.id]: e.target.value })}
                    className="text-sm px-2 py-1.5 border border-gray-300 rounded-lg flex-1" />
                  <Bouton variante="danger" onClick={() => gererRejet(a.id)}>Rejeter</Bouton>
                </div>
              )}

              {a.statut === 'approuvee' && (
                <div className="mt-4">
                  <Bouton variante="danger" onClick={() => gererSuppression(a.id)}>Retirer</Bouton>
                </div>
              )}

              {a.motif_rejet && (
                <p className="text-sm text-red-600 mt-2">Motif du rejet : {a.motif_rejet}</p>
              )}
            </Carte>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChangerPage={setPage} />
    </div>
  );
}
