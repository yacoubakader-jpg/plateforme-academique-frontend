// src/pages/DefiDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { obtenirDefi, rouvrirDefi } from '../api/defis';
import { creerEquipe, listerEquipesParDefi, rejoindreEquipe } from '../api/equipes';
import { deposerSoumission, listerSoumissionsParDefi } from '../api/soumissions';
import { creerEvaluation, listerEvaluationsParDefi } from '../api/evaluations';
import { listerMessagesEquipe, envoyerMessageEquipe, envoyerFichierEquipe, modifierMessage, supprimerMessage } from '../api/messagerie';
import { useAuth } from '../context/AuthContext';
import Carte from '../components/Carte';
import Badge from '../components/Badge';
import Bouton from '../components/Bouton';
import Champ from '../components/Champ';
import ZoneTexte from '../components/ZoneTexte';
import Chargement from '../components/Chargement';
import Alerte from '../components/Alerte';
import Discussion from '../components/Discussion';

export default function DefiDetailPage() {
  const { id } = useParams();
  const { utilisateur } = useAuth();

  const [defi, setDefi] = useState(null);
  const [equipes, setEquipes] = useState([]);
  const [soumissions, setSoumissions] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  const [nomNouvelleEquipe, setNomNouvelleEquipe] = useState('');
  const [fichierRapport, setFichierRapport] = useState(null);
  const [equipeChoisie, setEquipeChoisie] = useState('');
  const [equipeChatOuverte, setEquipeChatOuverte] = useState(null);

  const estCreateur = defi && utilisateur && defi.cree_par === utilisateur.id;
  const monEquipe = equipes.find(e => e.membres.some(m => m.id === utilisateur?.id));

  useEffect(() => {
    chargerDonnees();
  }, [id]);

  async function chargerDonnees() {
    setChargement(true);
    try {
      const data = await obtenirDefi(id);
      setDefi(data);
      const eqs = await listerEquipesParDefi(id);
      setEquipes(eqs);

      if (estCreateurLocal(data)) {
        const [sms, evs] = await Promise.all([
          listerSoumissionsParDefi(id),
          listerEvaluationsParDefi(id),
        ]);
        setSoumissions(sms);
        setEvaluations(evs);
      }
    } catch (err) {
      setErreur('Impossible de charger ce défi');
    } finally {
      setChargement(false);
    }
  }

  function estCreateurLocal(d) {
    return d && utilisateur && d.cree_par === utilisateur.id;
  }

  async function gererCreationEquipe() {
    setErreur(''); setSucces('');
    try {
      await creerEquipe(id, nomNouvelleEquipe);
      setSucces('Équipe créée !');
      setNomNouvelleEquipe('');
      chargerDonnees();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la création de l\'équipe');
    }
  }

  async function gererRejoindre(equipeId) {
    setErreur(''); setSucces('');
    try {
      await rejoindreEquipe(equipeId);
      setSucces('Vous avez rejoint l\'équipe !');
      chargerDonnees();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur en rejoignant l\'équipe');
    }
  }

  async function gererDepotSoumission() {
    setErreur(''); setSucces('');
    if (!fichierRapport) {
      setErreur('Sélectionnez un fichier');
      return;
    }
    try {
      await deposerSoumission(monEquipe.id, id, fichierRapport);
      setSucces('Rapport déposé avec succès !');
      setFichierRapport(null);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors du dépôt');
    }
  }

  if (chargement) return <Chargement />;
  if (!defi) return <p className="text-center text-gray-500 mt-12">Défi introuvable</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Carte className="mb-6">
        <div className="flex justify-between items-start mb-3">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{defi.probleme_a_resoudre}</h1>
          <div className="text-right">
            <Badge texte={defi.statut} />
            {defi.statut === 'cloture' && defi.cloture_automatiquement === 1 && (
              <p className="text-xs text-amber-600 mt-1">Clôturé automatiquement (échéance dépassée)</p>
            )}
          </div>
        </div>

        {estCreateur && defi.statut === 'cloture' && (
          <Bouton variante="secondaire" onClick={async () => { await rouvrirDefi(defi.id); chargerDonnees(); }}>
            Rouvrir le défi
          </Bouton>
        )}
        <p className="text-gray-600 mb-4">{defi.objectifs}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-500 mb-4">
          <p><span className="font-medium text-gray-700">Organisation :</span> {defi.nom_organisation}</p>
          <p><span className="font-medium text-gray-700">Durée :</span> {defi.duree_jours} jours</p>
          <p><span className="font-medium text-gray-700">Max/équipe :</span> {defi.max_etudiants_par_equipe} étudiants</p>
          <p><span className="font-medium text-gray-700">Présentation :</span> {new Date(defi.date_presentation).toLocaleDateString('fr-FR')}</p>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          <span className="font-medium text-gray-700">Livrables :</span> {defi.livrables_attendus}
        </p>

        {defi.technologies?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {defi.technologies.map((t) => (
              <span key={t} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">{t}</span>
            ))}
          </div>
        )}

        {defi.criteres?.length > 0 && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Critères d'évaluation</p>
            {defi.criteres.map((c) => (
              <p key={c.id} className="text-sm text-gray-500">• {c.critere} ({c.ponderation}%)</p>
            ))}
          </div>
        )}

        {defi.recompense && <p className="text-sm text-amber-600 mt-3">🏆 {defi.recompense}</p>}
      </Carte>

      <Alerte type="erreur" message={erreur} />
      <Alerte type="succes" message={succes} />

      {/* --- Équipes --- */}
      <Carte className="mb-6">
        <h2 className="font-medium text-gray-900 dark:text-white mb-4">Équipes ({equipes.length})</h2>

        {equipes.length > 0 && (
          <div className="space-y-3 mb-4">
            {equipes.map((e) => (
              <div key={e.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{e.nom_equipe}</p>
                    <p className="text-xs text-gray-400">
                      {e.membres.map(m => `${m.prenom} ${m.nom}`).join(', ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {utilisateur.role === 'etudiant' && !monEquipe && (
                      <Bouton variante="secondaire" onClick={() => gererRejoindre(e.id)}>Rejoindre</Bouton>
                    )}
                    {estCreateur && (
                      <Bouton
                        variante="secondaire"
                        onClick={() => setEquipeChatOuverte(equipeChatOuverte === e.id ? null : e.id)}
                      >
                        {equipeChatOuverte === e.id ? 'Fermer' : '💬 Discuter'}
                      </Bouton>
                    )}
                  </div>
                </div>

                {estCreateur && equipeChatOuverte === e.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Discussion
                      titre={`Discussion avec ${e.nom_equipe}`}
                      chargerMessages={() => listerMessagesEquipe(e.id)}
                      envoyerTexte={(contenu) => envoyerMessageEquipe(e.id, contenu)}
                      envoyerFichier={(fichier, duree) => envoyerFichierEquipe(e.id, fichier, duree)}
                      modifierMessage={modifierMessage}
                      supprimerMessage={supprimerMessage}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {utilisateur.role === 'etudiant' && !monEquipe && (
          <div className="flex gap-2">
            <input
              type="text" placeholder="Nom de votre équipe" value={nomNouvelleEquipe}
              onChange={(e) => setNomNouvelleEquipe(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <Bouton onClick={gererCreationEquipe}>Créer une équipe</Bouton>
          </div>
        )}
      </Carte>

      {/* --- Dépôt de soumission (membre d'une équipe) --- */}
      {monEquipe && (
        <Carte className="mb-6">
          <h2 className="font-medium text-gray-900 dark:text-white mb-3">Déposer votre rapport (équipe : {monEquipe.nom_equipe})</h2>
          <p className="text-xs text-gray-400 mb-3">Formats acceptés : .docx, .doc, .xlsx, .xls</p>
          <input
            type="file" accept=".docx,.doc,.xlsx,.xls"
            onChange={(e) => setFichierRapport(e.target.files[0])}
            className="text-sm text-gray-600 mb-3"
          />
          <Bouton onClick={gererDepotSoumission}>Déposer le rapport</Bouton>
        </Carte>
      )}

      {/* --- Discussion avec l'équipe (membre) --- */}
      {monEquipe && (
        <Carte className="mb-6">
          <Discussion
            titre="Discussion de mon équipe"
            chargerMessages={() => listerMessagesEquipe(monEquipe.id)}
            envoyerTexte={(contenu) => envoyerMessageEquipe(monEquipe.id, contenu)}
            envoyerFichier={(fichier, duree) => envoyerFichierEquipe(monEquipe.id, fichier, duree)}
            modifierMessage={modifierMessage}
            supprimerMessage={supprimerMessage}
          />
        </Carte>
      )}

      {/* --- Vue créateur : soumissions à évaluer --- */}
      {estCreateur && (
        <Carte>
          <h2 className="font-medium text-gray-900 dark:text-white mb-4">Soumissions reçues ({soumissions.length})</h2>
          {soumissions.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucune soumission pour l'instant.</p>
          ) : (
            <div className="space-y-4">
              {soumissions.map((s) => {
                const evaluationExistante = evaluations.find(ev => ev.equipe_id === s.equipe_id);
                return (
                  <FormulaireEvaluation
                    key={s.id}
                    soumission={s}
                    criteres={defi.criteres}
                    evaluationExistante={evaluationExistante}
                    onEvaluer={chargerDonnees}
                  />
                );
              })}
            </div>
          )}
        </Carte>
      )}
    </div>
  );
}

function FormulaireEvaluation({ soumission, criteres, evaluationExistante, onEvaluer }) {
  const [noteGlobale, setNoteGlobale] = useState('');
  const [commentaires, setCommentaires] = useState('');
  const [estGagnant, setEstGagnant] = useState(false);
  const [notesParCritere, setNotesParCritere] = useState(
    criteres.map(c => ({ critereId: c.id, note: '' }))
  );
  const [chargement, setChargement] = useState(false);

  function modifierNoteCritere(index, valeur) {
    const copie = [...notesParCritere];
    copie[index].note = valeur;
    setNotesParCritere(copie);
  }

  async function soumettreEvaluation() {
    setChargement(true);
    try {
      await creerEvaluation({
        soumissionId: soumission.id,
        noteGlobale: Number(noteGlobale),
        commentaires,
        estGagnant,
        notesParCritere: notesParCritere
          .filter(n => n.note !== '')
          .map(n => ({ critereId: n.critereId, note: Number(n.note) })),
      });
      onEvaluer();
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="border border-gray-100 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <p className="font-medium text-sm text-gray-900 dark:text-white">{soumission.nom_equipe}</p>
        <a href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${soumission.fichier_url}`}
           target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
          Télécharger le rapport ({soumission.format_fichier})
        </a>
      </div>

      {evaluationExistante ? (
        <div className="mt-2 text-sm">
          <Badge texte={evaluationExistante.est_gagnant ? 'excellence' : 'evalue'} />
          <p className="text-gray-500 mt-1">Note : {evaluationExistante.note_globale}/20</p>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {criteres.map((c, i) => (
            <div key={c.id} className="flex items-center gap-2 text-sm">
              <span className="w-32 text-gray-600">{c.critere} ({c.ponderation}%)</span>
              <input type="number" min="0" max="20" value={notesParCritere[i].note}
                onChange={(e) => modifierNoteCritere(i, e.target.value)}
                className="w-20 px-2 py-1 border border-gray-300 rounded" placeholder="/20" />
            </div>
          ))}
          <Champ label="Note globale (/20)" type="number" min="0" max="20"
            value={noteGlobale} onChange={(e) => setNoteGlobale(e.target.value)} requis />
          <ZoneTexte label="Commentaires" value={commentaires}
            onChange={(e) => setCommentaires(e.target.value)} lignes={2} />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={estGagnant} onChange={(e) => setEstGagnant(e.target.checked)} />
            Équipe gagnante (badge d'excellence)
          </label>
          <Bouton onClick={soumettreEvaluation} disabled={chargement || !noteGlobale}>
            {chargement ? 'Envoi...' : 'Valider l\'évaluation'}
          </Bouton>
        </div>
      )}
    </div>
  );
}
