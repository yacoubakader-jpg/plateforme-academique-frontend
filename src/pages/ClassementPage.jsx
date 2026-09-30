// src/pages/ClassementPage.jsx

import { useState, useEffect } from 'react';
import { obtenirClassement } from '../api/classement';
import { useAuth } from '../context/AuthContext';
import Carte from '../components/Carte';
import Chargement from '../components/Chargement';

const MEDAILLES = ['🥇', '🥈', '🥉'];

export default function ClassementPage() {
  const { utilisateur } = useAuth();
  const [portee, setPortee] = useState('universite');
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    setChargement(true);
    obtenirClassement(portee).then(setDonnees).finally(() => setChargement(false));
  }, [portee]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">Classement</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        1 point par badge de participation, 2 points par badge d'excellence
      </p>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setPortee('universite')}
          className={`px-3 py-1.5 rounded-lg text-sm ${portee === 'universite' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600'}`}>
          Mon université
        </button>
        <button onClick={() => setPortee('national')}
          className={`px-3 py-1.5 rounded-lg text-sm ${portee === 'national' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600'}`}>
          National
        </button>
      </div>

      {chargement ? (
        <Chargement />
      ) : (
        <>
          {donnees.monRang && (
            <Carte className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Vous êtes classé <span className="font-semibold text-blue-700 dark:text-blue-400">{donnees.monRang.rang}ᵉ</span> sur {donnees.monRang.totalParticipants}, avec <span className="font-semibold">{donnees.monRang.score} points</span>.
              </p>
            </Carte>
          )}

          {donnees.classement.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Aucun étudiant classé pour l'instant.</p>
          ) : (
            <Carte>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {donnees.classement.map((etudiant) => {
                  const estMoi = etudiant.id === utilisateur.id;
                  return (
                    <div key={etudiant.id} className={`flex items-center justify-between py-3 ${estMoi ? 'bg-blue-50 dark:bg-blue-950 -mx-6 px-6' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className="w-8 text-center font-medium text-gray-500 dark:text-gray-400">
                          {MEDAILLES[etudiant.rang - 1] || etudiant.rang}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {etudiant.prenom} {etudiant.nom} {estMoi && <span className="text-xs text-blue-600 dark:text-blue-400">(vous)</span>}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {etudiant.niveau} · {etudiant.nom_organisation}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">{etudiant.score} pts</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {etudiant.nombre_participation} 🎖️ · {etudiant.nombre_excellence} 🏆
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Carte>
          )}
        </>
      )}
    </div>
  );
}
