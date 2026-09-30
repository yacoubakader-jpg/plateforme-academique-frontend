// src/pages/ProjetDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { obtenirProjet, candidater, listerCandidatures, traiterCandidature,
         proposerAccompagnement, listerPropositions, traiterProposition, rouvrirProjet } from '../api/projets';
import { listerMessagesProjet, envoyerMessageProjet, envoyerFichierProjet, modifierMessage, supprimerMessage } from '../api/messagerie';
import { useAuth } from '../context/AuthContext';
import Carte from '../components/Carte';
import Badge from '../components/Badge';
import Bouton from '../components/Bouton';
import ZoneTexte from '../components/ZoneTexte';
import Chargement from '../components/Chargement';
import Alerte from '../components/Alerte';
import Discussion from '../components/Discussion';

export default function ProjetDetailPage() {
  const { id } = useParams();
  const { utilisateur } = useAuth();

  const [projet, setProjet] = useState(null);
  const [candidatures, setCandidatures] = useState([]);
  const [propositions, setPropositions] = useState([]);
  const [message, setMessage] = useState('');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  const estAuteur = projet && utilisateur && projet.etudiant_id === utilisateur.id;
  const maCandidatureAcceptee = candidatures.find(
    (c) => c.etudiant_id === utilisateur.id && c.statut === 'acceptee'
  );
  const peutDiscuter = projet && utilisateur && (
    estAuteur ||
    projet.professeur_associe_id === utilisateur.id ||
    !!maCandidatureAcceptee
  );

  useEffect(() => {
    chargerDonnees();
  }, [id]);

  async function chargerDonnees() {
    setChargement(true);
    try {
      const data = await obtenirProjet(id);
      setProjet(data);
      const [cands, props] = await Promise.all([
        listerCandidatures(id),
        listerPropositions(id),
      ]);
      setCandidatures(cands);
      setPropositions(props);
    } catch (err) {
      setErreur('Impossible de charger ce projet');
    } finally {
      setChargement(false);
    }
  }

  async function gererCandidature() {
    setErreur(''); setSucces('');
    try {
      await candidater(id, message);
      setSucces('Candidature envoyée !');
      setMessage('');
      chargerDonnees();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la candidature');
    }
  }

  async function gererProposition() {
    setErreur(''); setSucces('');
    try {
      await proposerAccompagnement(id, message);
      setSucces('Proposition d\'accompagnement envoyée !');
      setMessage('');
      chargerDonnees();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la proposition');
    }
  }

  async function gererStatutCandidature(candidatureId, statut, motif) {
    setErreur('');
    try {
      await traiterCandidature(id, candidatureId, statut, motif);
      chargerDonnees();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors du traitement de la candidature');
    }
  }

  async function gererStatutProposition(propositionId, statut, professeurId, motif) {
    setErreur('');
    try {
      await traiterProposition(id, propositionId, statut, professeurId, motif);
      chargerDonnees();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors du traitement de la proposition');
    }
  }

  if (chargement) return <Chargement />;
  if (!projet) return <p className="text-center text-gray-500 mt-12">Projet introuvable</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Carte className="mb-6">
        <div className="flex justify-between items-start mb-3">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{projet.titre}</h1>
          <div className="text-right">
            <Badge texte={projet.statut} />
            {projet.statut === 'cloture' && projet.cloture_automatiquement === 1 && (
              <p className="text-xs text-amber-600 mt-1">Clôturé automatiquement (échéance dépassée)</p>
            )}
          </div>
        </div>

        {estAuteur && projet.statut === 'cloture' && (
          <Bouton variante="secondaire" onClick={async () => { await rouvrirProjet(projet.id); chargerDonnees(); }}>
            Rouvrir le projet
          </Bouton>
        )}
        <p className="text-gray-600 mb-4">{projet.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-500 mb-4">
          <p><span className="font-medium text-gray-700">Domaine :</span> {projet.domaine}</p>
          <p><span className="font-medium text-gray-700">Niveau :</span> {projet.niveau}</p>
          <p><span className="font-medium text-gray-700">Durée :</span> {projet.duree}</p>
          <p><span className="font-medium text-gray-700">Participants recherchés :</span> {projet.nombre_participants}</p>
          <p><span className="font-medium text-gray-700">Organisation :</span> {projet.nom_organisation}</p>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          <span className="font-medium text-gray-700">Livrables attendus :</span> {projet.livrables_attendus}
        </p>

        {projet.competences?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {projet.competences.map((c) => (
              <span key={c} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{c}</span>
            ))}
          </div>
        )}
      </Carte>

      <Alerte type="erreur" message={erreur} />
      <Alerte type="succes" message={succes} />

      {!estAuteur && utilisateur.role === 'etudiant' && (
        <Carte className="mb-6">
          <h2 className="font-medium text-gray-900 dark:text-white mb-3">Candidater à ce projet</h2>
          <ZoneTexte value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Expliquez pourquoi vous voulez rejoindre ce projet..." lignes={3} />
          <Bouton onClick={gererCandidature}>Envoyer ma candidature</Bouton>
        </Carte>
      )}

      {!estAuteur && utilisateur.role === 'professeur' && (
        <Carte className="mb-6">
          <h2 className="font-medium text-gray-900 dark:text-white mb-3">Proposer votre accompagnement</h2>
          <ZoneTexte value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Décrivez comment vous pouvez accompagner ce projet..." lignes={3} />
          <Bouton onClick={gererProposition}>Envoyer ma proposition</Bouton>
        </Carte>
      )}

      {estAuteur && (
        <>
          <Carte className="mb-6">
            <h2 className="font-medium text-gray-900 dark:text-white mb-4">Candidatures reçues ({candidatures.length})</h2>
            {candidatures.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucune candidature pour l'instant.</p>
            ) : (
              <div className="space-y-3">
                {candidatures.map((c) => (
                  <div key={c.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{c.prenom} {c.nom}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                        {c.message && <p className="text-sm text-gray-600 mt-1">{c.message}</p>}
                      </div>
                      <Badge texte={c.statut} />
                    </div>
                    <LigneDecision
                      statut={c.statut}
                      motifRejet={c.motif_rejet}
                      onAccepter={() => gererStatutCandidature(c.id, 'acceptee')}
                      onRefuser={(motif) => gererStatutCandidature(c.id, 'refusee', motif)}
                    />
                  </div>
                ))}
              </div>
            )}
          </Carte>

          <Carte>
            <h2 className="font-medium text-gray-900 dark:text-white mb-4">Propositions d'accompagnement ({propositions.length})</h2>
            {propositions.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucune proposition pour l'instant.</p>
            ) : (
              <div className="space-y-3">
                {propositions.map((p) => (
                  <div key={p.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{p.prenom} {p.nom}</p>
                        <p className="text-xs text-gray-400">{p.email}</p>
                        {p.message && <p className="text-sm text-gray-600 mt-1">{p.message}</p>}
                      </div>
                      <Badge texte={p.statut} />
                    </div>
                    <LigneDecision
                      statut={p.statut}
                      motifRejet={p.motif_rejet}
                      onAccepter={() => gererStatutProposition(p.id, 'acceptee', p.professeur_id)}
                      onRefuser={(motif) => gererStatutProposition(p.id, 'refusee', p.professeur_id, motif)}
                    />
                  </div>
                ))}
              </div>
            )}
          </Carte>
        </>
      )}

      {peutDiscuter && (
        <Carte className="mt-6">
          <Discussion
            titre="Discussion du projet"
            chargerMessages={() => listerMessagesProjet(id)}
            envoyerTexte={(contenu) => envoyerMessageProjet(id, contenu)}
            envoyerFichier={(fichier, duree) => envoyerFichierProjet(id, fichier, duree)}
            modifierMessage={modifierMessage}
            supprimerMessage={supprimerMessage}
          />
        </Carte>
      )}
    </div>
  );
}

// Composant partagé pour accepter/refuser une candidature ou une proposition.
// En cas de refus, force la saisie d'un motif avant de pouvoir confirmer —
// c'est plus respectueux pour la personne qui reçoit le refus, et ça garde
// une trace utile si la décision est questionnée plus tard.
function LigneDecision({ statut, motifRejet, onAccepter, onRefuser }) {
  const [modeRejet, setModeRejet] = useState(false);
  const [motif, setMotif] = useState('');

  if (statut === 'refusee') {
    return motifRejet
      ? <p className="text-sm text-red-600 mt-2">Motif du rejet : {motifRejet}</p>
      : null;
  }

  if (statut !== 'en_attente') return null;

  if (modeRejet) {
    return (
      <div className="mt-3">
        <input
          type="text"
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          placeholder="Motif du rejet (obligatoire)"
          autoFocus
          className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-lg mb-2"
        />
        <div className="flex gap-2">
          <Bouton variante="danger" disabled={!motif.trim()} onClick={() => onRefuser(motif.trim())}>
            Confirmer le rejet
          </Bouton>
          <Bouton variante="secondaire" onClick={() => { setModeRejet(false); setMotif(''); }}>
            Annuler
          </Bouton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mt-3">
      <Bouton variante="succes" onClick={onAccepter}>Accepter</Bouton>
      <Bouton variante="danger" onClick={() => setModeRejet(true)}>Refuser</Bouton>
    </div>
  );
}
