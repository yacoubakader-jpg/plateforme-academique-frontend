// src/components/Discussion.jsx
//
// Panneau de discussion réutilisé pour les projets et les équipes.
//
// Choix technique : on rafraîchit la liste des messages toutes les 4
// secondes (polling) plutôt que d'utiliser une connexion WebSocket —
// plus simple à déployer sur un hébergement classique.
//
// ⚠️ L'enregistrement vocal utilise l'API microphone du navigateur
// (getUserMedia), qui nécessite une connexion sécurisée (HTTPS), sauf
// sur localhost. Sur un réseau local en HTTP simple, le bouton micro
// affichera une erreur de permission — c'est une limite du navigateur,
// pas un bug de l'application.

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import SelecteurEmoji from './SelecteurEmoji';
import { FaSmile, FaPaperclip, FaMicrophone } from "react-icons/fa";

const INTERVALLE_ACTUALISATION_MS = 4000;
const URL_BASE_BACKEND = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');

function urlFichier(cheminRelatif) {
  return `${URL_BASE_BACKEND}${cheminRelatif}`;
}

function formaterDuree(secondes) {
  const s = Math.floor(secondes % 60).toString().padStart(2, '0');
  const m = Math.floor(secondes / 60);
  return `${m}:${s}`;
}

export default function Discussion({ chargerMessages, envoyerTexte, envoyerFichier, modifierMessage, supprimerMessage, titre = 'Discussion' }) {
  const { utilisateur } = useAuth();
  const [messages, setMessages] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [emojiOuvert, setEmojiOuvert] = useState(false);
  const [messageEnEdition, setMessageEnEdition] = useState(null);
  const [texteEdition, setTexteEdition] = useState('');
  const [menuOuvertPour, setMenuOuvertPour] = useState(null);

  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false);
  const [dureeEnregistrement, setDureeEnregistrement] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksAudioRef = useRef([]);
  const minuteurRef = useRef(null);

  const finDesMessagesRef = useRef(null);
  const inputFichierRef = useRef(null);

  useEffect(() => {
    actualiser();
    const intervalle = setInterval(actualiser, INTERVALLE_ACTUALISATION_MS);
    return () => {
      clearInterval(intervalle);
      if (minuteurRef.current) clearInterval(minuteurRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    finDesMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function actualiser() {
    try {
      const donnees = await chargerMessages();
      setMessages(donnees);
      setErreur('');
    } catch (err) {
      if (messages.length === 0) {
        setErreur(err.response?.data?.erreur || 'Impossible de charger la discussion');
      }
    } finally {
      setChargement(false);
    }
  }

  async function gererEnvoiTexte(e) {
    e.preventDefault();
    if (!nouveauMessage.trim()) return;

    setEnvoiEnCours(true);
    try {
      await envoyerTexte(nouveauMessage.trim());
      setNouveauMessage('');
      await actualiser();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de l\'envoi du message');
    } finally {
      setEnvoiEnCours(false);
    }
  }

  function gererSelectionEmoji(emoji) {
    setNouveauMessage((texte) => texte + emoji);
  }

  async function gererSelectionFichier(e) {
    const fichier = e.target.files[0];
    if (!fichier) return;

    setEnvoiEnCours(true);
    try {
      await envoyerFichier(fichier);
      await actualiser();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de l\'envoi du fichier');
    } finally {
      setEnvoiEnCours(false);
      e.target.value = '';
    }
  }

  async function demarrerEnregistrement() {
    try {
      const flux = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(flux);
      chunksAudioRef.current = [];

      recorder.ondataavailable = (e) => chunksAudioRef.current.push(e.data);
      recorder.onstop = async () => {
        flux.getTracks().forEach((piste) => piste.stop());
        const blob = new Blob(chunksAudioRef.current, { type: 'audio/webm' });
        const fichierAudio = new File([blob], 'message-vocal.webm', { type: 'audio/webm' });

        setEnvoiEnCours(true);
        try {
          await envoyerFichier(fichierAudio, dureeEnregistrement);
          await actualiser();
        } catch (err) {
          setErreur(err.response?.data?.erreur || 'Erreur lors de l\'envoi du vocal');
        } finally {
          setEnvoiEnCours(false);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setEnregistrementEnCours(true);
      setDureeEnregistrement(0);
      minuteurRef.current = setInterval(() => setDureeEnregistrement((d) => d + 1), 1000);
    } catch (err) {
      setErreur('Accès au microphone refusé ou indisponible (nécessite HTTPS, sauf sur localhost)');
    }
  }

  function arreterEnregistrement() {
    mediaRecorderRef.current?.stop();
    clearInterval(minuteurRef.current);
    setEnregistrementEnCours(false);
  }

  function demarrerEdition(message) {
    setMessageEnEdition(message.id);
    setTexteEdition(message.contenu);
    setMenuOuvertPour(null);
  }

  async function confirmerEdition(id) {
    if (!texteEdition.trim()) return;
    try {
      await modifierMessage(id, texteEdition.trim());
      setMessageEnEdition(null);
      await actualiser();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la modification');
    }
  }

  async function gererSuppression(id) {
    setMenuOuvertPour(null);
    try {
      await supprimerMessage(id);
      await actualiser();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la suppression');
    }
  }

  if (chargement) {
    return <p className="text-sm text-gray-400">Chargement de la discussion...</p>;
  }

  if (erreur && messages.length === 0) {
    return <p className="text-sm text-gray-400">{erreur}</p>;
  }

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-3">{titre}</h3>

      {erreur && <p className="text-xs text-red-500 mb-2">{erreur}</p>}

      <div className="border border-gray-100 rounded-lg p-3 h-72 overflow-y-auto mb-3 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-400 text-center mt-8">Aucun message pour l'instant.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => {
              const estMoi = m.auteur_id === utilisateur.id;
              const enEdition = messageEnEdition === m.id;

              return (
                <div key={m.id} className={`flex items-end gap-1 ${estMoi ? 'justify-end' : 'justify-start'}`}>
                  {/* Le menu "⋯" est maintenant un élément normal de la ligne flex
                      (plutôt que positionné en absolu par-dessus la bulle) :
                      il s'aligne correctement quelle que soit la largeur de la
                      bulle, qu'il s'agisse d'un texte court, d'un fichier ou
                      d'un lecteur audio (qui a sa propre largeur minimale). */}
                  {estMoi && !m.supprime && !enEdition && (
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setMenuOuvertPour(menuOuvertPour === m.id ? null : m.id)}
                        className="bg-white border border-gray-200 rounded-full w-5 h-5 text-xs text-gray-500 shadow-sm flex items-center justify-center"
                      >
                        ⋯
                      </button>
                      {menuOuvertPour === m.id && (
                        <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-32 z-50 text-gray-700">
                          {m.type_message === 'texte' && (
                            <button onClick={() => demarrerEdition(m)} className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50">
                              Modifier
                            </button>
                          )}
                          <button onClick={() => gererSuppression(m.id)} className="block w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-gray-50">
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`max-w-[75%] min-w-0 rounded-lg px-3 py-2 text-sm ${estMoi ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                    {!estMoi && (
                      <p className="text-xs font-medium mb-0.5 opacity-70">{m.prenom} {m.nom}</p>
                    )}

                    {m.supprime ? (
                      <p className="italic opacity-60">Ce message a été supprimé</p>
                    ) : enEdition ? (
                      <div>
                        <input
                          type="text" value={texteEdition} autoFocus
                          onChange={(e) => setTexteEdition(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && confirmerEdition(m.id)}
                          className="text-gray-900 px-2 py-1 rounded w-full text-sm"
                        />
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => confirmerEdition(m.id)} className="text-xs underline">Valider</button>
                          <button onClick={() => setMessageEnEdition(null)} className="text-xs underline opacity-70">Annuler</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {m.type_message === 'fichier' && (
                          <a href={urlFichier(m.fichier_url)} target="_blank" rel="noreferrer"
                            className={`flex items-center gap-2 underline ${estMoi ? 'text-white' : 'text-blue-600'}`}>
                            📎 {m.fichier_nom}
                          </a>
                        )}
                        {m.type_message === 'vocal' && (
                          <div className="min-w-0 overflow-x-auto">
                            <audio controls src={urlFichier(m.fichier_url)} className="max-w-[220px] h-8" />
                            {m.duree_secondes && (
                              <p className="text-[10px] mt-0.5 opacity-70">🎤 {formaterDuree(m.duree_secondes)}</p>
                            )}
                          </div>
                        )}
                        {m.contenu && <p className="whitespace-pre-wrap break-words">{m.contenu}</p>}
                      </>
                    )}

                    <div className="flex items-center gap-1 mt-1">
                      <p className={`text-[10px] ${estMoi ? 'text-blue-100' : 'text-gray-400'}`}>
                        {new Date(m.date_envoi).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        {m.modifie && ' · modifié'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={finDesMessagesRef} />
          </div>
        )}
      </div>

      {enregistrementEnCours ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm text-red-700">Enregistrement... {formaterDuree(dureeEnregistrement)}</span>
          <button onClick={arreterEnregistrement} className="ml-auto text-sm text-red-700 underline">
            Arrêter et envoyer
          </button>
        </div>
      ) : (
        <form onSubmit={gererEnvoiTexte} className="flex gap-1.5 relative items-center">
          {emojiOuvert && (
            <SelecteurEmoji onSelection={gererSelectionEmoji} onFermer={() => setEmojiOuvert(false)} />
          )}

          <button type="button" onClick={() => setEmojiOuvert(!emojiOuvert)}
            className="text-lg px-1  shrink-0 text-yellow-500 hover:text-yellow-600 transition" title="Emoji">
            <FaSmile />
          </button>

          <button type="button" onClick={() => inputFichierRef.current?.click()}
            className="text-lg px-1 shrink-0 text-blue-500 hover:text-blue-600 transition" title="Joindre un fichier" disabled={envoiEnCours}>
            <FaPaperclip />
          </button>
          <input ref={inputFichierRef} type="file" onChange={gererSelectionFichier} className="hidden" />

          <button type="button" onClick={demarrerEnregistrement}
            className="text-lg px-1 shrink-0 text-red-500 hover:text-red-600 transition" title="Message vocal" disabled={envoiEnCours}>
            <FaMicrophone />
          </button>

          {/* min-w-0 est essentiel ici : sans lui, un <input> dans une ligne
              flex refuse de rétrécir en dessous de sa largeur de contenu,
              ce qui provoquait le débordement horizontal sur petit écran. */}
          <input
            type="text"
            value={nouveauMessage}
            onChange={(e) => setNouveauMessage(e.target.value)}
            placeholder="Écrire un message..."
            disabled={envoiEnCours}
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />

          {/* Bouton d'envoi compact (icône seule) : garde une taille fixe et
              raisonnable même sur les très petits écrans, contrairement à
              un bouton texte "Envoyer" qui prenait trop de place. */}
          <button
            type="submit"
            disabled={envoiEnCours || !nouveauMessage.trim()}
            title="Envoyer"
            className="shrink-0 w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            ➤
          </button>
        </form>
      )}
    </div>
  );
}
