// src/pages/admin/DemandesInscriptionPage.jsx

import { useState, useEffect } from 'react';
import { listerDemandes, approuverDemande, rejeterDemande } from '../../api/demandes';
import Carte from '../../components/Carte';
import Bouton from '../../components/Bouton';
import Badge from '../../components/Badge';
import Chargement from '../../components/Chargement';
import Alerte from '../../components/Alerte';
import Pagination from '../../components/Pagination';

export default function DemandesInscriptionPage() {
  const [demandes, setDemandes] = useState([]);
  const [filtre, setFiltre] = useState('en_attente');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [motifRejet, setMotifRejet] = useState({});

  useEffect(() => {
    setPage(1); // repartir à la page 1 quand on change de filtre
  }, [filtre]);

  useEffect(() => {
    chargerDemandes();
  }, [filtre, page]);

  async function chargerDemandes() {
    setChargement(true);
    try {
      const reponse = await listerDemandes(filtre, page, 10);
      setDemandes(reponse.donnees);
      setTotalPages(reponse.totalPages);
    } catch (err) {
      setErreur('Impossible de charger les demandes');
    } finally {
      setChargement(false);
    }
  }

  async function gererApprobation(id) {
    try {
      await approuverDemande(id);
      chargerDemandes();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de l\'approbation');
    }
  }

  async function gererRejet(id) {
    try {
      await rejeterDemande(id, motifRejet[id] || 'Non précisé');
      chargerDemandes();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors du rejet');
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Demandes d'inscription</h1>

      <Alerte message={erreur} />

      <div className="flex gap-2 mb-6">
        {['en_attente', 'approuvee', 'rejetee'].map((s) => (
          <button
            key={s}
            onClick={() => setFiltre(s)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filtre === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-300'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {chargement ? (
        <Chargement />
      ) : demandes.length === 0 ? (
        <p className="text-gray-500">Aucune demande dans cette catégorie.</p>
      ) : (
        <div className="space-y-4">
          {demandes.map((d) => (
            <Carte key={d.id}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {d.type_demande === 'organisation'
                      ? d.nom_organisation
                      : `${d.prenom} ${d.nom}`}
                  </p>
                  <p className="text-sm text-gray-500">{d.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Type : {d.type_demande} {d.type_organisation ? `(${d.type_organisation})` : ''}
                  </p>
                </div>
                <Badge texte={d.statut} />
              </div>

              {d.document_url && (
                <a
                  href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${d.document_url}`}
                  target="_blank" rel="noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Voir le document justificatif
                </a>
              )}

              {d.statut === 'en_attente' && (
                <div className="flex items-center gap-2 mt-4">
                  <Bouton variante="succes" onClick={() => gererApprobation(d.id)}>Approuver</Bouton>
                  <input
                    type="text"
                    placeholder="Motif de rejet (optionnel)"
                    value={motifRejet[d.id] || ''}
                    onChange={(e) => setMotifRejet({ ...motifRejet, [d.id]: e.target.value })}
                    className="text-sm px-2 py-1.5 border border-gray-300 rounded-lg flex-1"
                  />
                  <Bouton variante="danger" onClick={() => gererRejet(d.id)}>Rejeter</Bouton>
                </div>
              )}

              {d.motif_rejet && (
                <p className="text-sm text-red-600 mt-2">Motif du rejet : {d.motif_rejet}</p>
              )}
            </Carte>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChangerPage={setPage} />
    </div>
  );
}
