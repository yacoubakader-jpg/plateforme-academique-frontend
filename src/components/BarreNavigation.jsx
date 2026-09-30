// src/components/BarreNavigation.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationCloche from './NotificationCloche';

export default function BarreNavigation() {
  const { utilisateur, seDeconnecter } = useAuth();
  const { themeSombre, basculerTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);

  function gererDeconnexion() {
    seDeconnecter();
    navigate('/connexion');
  }

  function gererClicLien() {
    setMenuOuvert(false); // referme le menu mobile après un clic sur un lien
  }

  if (!utilisateur) return null;

  const estOrganisation = ['professeur', 'representant_entreprise', 'admin_plateforme'].includes(utilisateur.role);

  const liens = (
    <>
      <Link to="/projets" onClick={gererClicLien} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm block md:inline">Projets</Link>
      <Link to="/defis" onClick={gererClicLien} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm block md:inline">Défis</Link>
      <Link to="/badges" onClick={gererClicLien} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm block md:inline">Mes badges</Link>
      <Link to="/annonces" onClick={gererClicLien} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm block md:inline">Annonces</Link>
      <Link to="/favoris" onClick={gererClicLien} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm block md:inline">Favoris</Link>
      <Link to="/classement" onClick={gererClicLien} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm block md:inline">Classement</Link>
      {estOrganisation && (
        <>
          <Link to="/analytics" onClick={gererClicLien} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm block md:inline">Tableau de bord</Link>
          <Link to="/candidats" onClick={gererClicLien} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm block md:inline">Candidats</Link>
        </>
      )}
      {utilisateur.role === 'admin_plateforme' && (
        <Link to="/admin/demandes" onClick={gererClicLien} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm block md:inline">
          Demandes d'inscription
        </Link>
      )}
      {utilisateur.role === 'admin_plateforme' && (
        <Link to="/admin/annonces" onClick={gererClicLien} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm block md:inline">
          Modération annonces
        </Link>
      )}
    </>
  );

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold text-blue-600 dark:text-blue-400 text-lg">Plateforme Académique</Link>
          {/* Liens visibles en ligne uniquement à partir de la taille "md" (tablette/desktop) */}
          <div className="hidden md:flex items-center gap-6">{liens}</div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={basculerTheme} title="Changer de thème" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
            {themeSombre ? '☀️' : '🌙'}
          </button>
          <NotificationCloche />
          {/* Nom et rôle masqués sur mobile pour économiser la place, gardés sur desktop */}
          <Link to="/profil" className="hidden md:inline text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
            {utilisateur.prenom} {utilisateur.nom} · <span className="italic">{utilisateur.role.replace(/_/g, ' ')}</span>
          </Link>
          <button onClick={gererDeconnexion} className="hidden md:inline text-sm text-red-600 hover:text-red-800">
            Déconnexion
          </button>

          {/* Bouton hamburger, visible uniquement sur mobile */}
          <button
            onClick={() => setMenuOuvert(!menuOuvert)}
            className="md:hidden p-2 text-gray-600"
            aria-label="Ouvrir le menu"
          >
            {menuOuvert ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Panneau déroulant mobile */}
      {menuOuvert && (
        <div className="md:hidden mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
          {liens}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <Link to="/profil" onClick={gererClicLien} className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">
              {utilisateur.prenom} {utilisateur.nom} · <span className="italic">{utilisateur.role.replace(/_/g, ' ')}</span>
            </Link>
            <button onClick={gererDeconnexion} className="text-sm text-red-600 hover:text-red-800">
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
