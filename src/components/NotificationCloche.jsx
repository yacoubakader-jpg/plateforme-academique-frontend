// src/components/NotificationCloche.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { listerNotifications, compterNonLues, marquerCommeLue, marquerToutesCommeLues } from '../api/notifications';
import { activerNotificationsPush, desactiverNotificationsPush, notificationsPushActives, pushEstSupporte } from '../utils/push';

const INTERVALLE_ACTUALISATION_MS = 20000;

export default function NotificationCloche() {
  const [ouvert, setOuvert] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [compteNonLues, setCompteNonLues] = useState(0);
  const [pushActif, setPushActif] = useState(false);
  const refPanneau = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    actualiserCompte();
    const intervalle = setInterval(actualiserCompte, INTERVALLE_ACTUALISATION_MS);
    if (pushEstSupporte()) {
      notificationsPushActives().then(setPushActif);
    }
    return () => clearInterval(intervalle);
  }, []);

  useEffect(() => {
    function gererClicExterieur(e) {
      if (refPanneau.current && !refPanneau.current.contains(e.target)) {
        setOuvert(false);
      }
    }
    document.addEventListener('mousedown', gererClicExterieur);
    return () => document.removeEventListener('mousedown', gererClicExterieur);
  }, []);

  async function actualiserCompte() {
    try {
      const { total } = await compterNonLues();
      setCompteNonLues(total);
    } catch {
      // silencieux : pas grave si un poll échoue
    }
  }

  async function ouvrirPanneau() {
    const nouvelEtat = !ouvert;
    setOuvert(nouvelEtat);
    if (nouvelEtat) {
      const liste = await listerNotifications();
      setNotifications(liste);
    }
  }

  async function gererClicNotification(notif) {
    if (!notif.lu) {
      await marquerCommeLue(notif.id);
      actualiserCompte();
    }
    setOuvert(false);
    if (notif.lien) navigate(notif.lien);
  }

  async function gererToutLire() {
    await marquerToutesCommeLues();
    setNotifications((liste) => liste.map((n) => ({ ...n, lu: true })));
    setCompteNonLues(0);
  }

  async function gererActivationPush() {
    try {
      if (pushActif) {
        await desactiverNotificationsPush();
        setPushActif(false);
      } else {
        await activerNotificationsPush();
        setPushActif(true);
      }
    } catch (err) {
      alert(err.message || 'Impossible de gérer les notifications push');
    }
  }

  return (
    <div className="relative" ref={refPanneau}>
      <button onClick={ouvrirPanneau} className="relative p-2 text-gray-500 hover:text-gray-800">
        🔔
        {compteNonLues > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {compteNonLues > 9 ? '9+' : compteNonLues}
          </span>
        )}
      </button>

      {ouvert && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
            <span className="font-medium text-sm text-gray-900">Notifications</span>
            <button onClick={gererToutLire} className="text-xs text-blue-600 hover:underline">
              Tout marquer lu
            </button>
          </div>

          {pushEstSupporte() && (
            <div className="px-4 py-2 border-b border-gray-100">
              <button onClick={gererActivationPush} className="text-xs text-gray-600 hover:underline">
                {pushActif ? '🔕 Désactiver les notifications push' : '🔔 Activer les notifications push'}
              </button>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Aucune notification.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => gererClicNotification(n)}
                  className={`block w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${!n.lu ? 'bg-blue-50' : ''}`}
                >
                  <p className="text-sm text-gray-900">{n.titre}</p>
                  {n.contenu && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.contenu}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(n.date_creation).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
