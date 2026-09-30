// src/components/RouteProtegee.jsx
//
// Enveloppe une page : redirige vers /connexion si personne n'est
// connecté, ou affiche un message si le rôle ne correspond pas
// (équivalent du middleware autoriserRoles côté backend).

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RouteProtegee({ children, rolesAutorises }) {
  const { utilisateur } = useAuth();

  if (!utilisateur) {
    return <Navigate to="/connexion" replace />;
  }

  if (rolesAutorises && !rolesAutorises.includes(utilisateur.role)) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <p className="text-gray-600">
          Vous n'avez pas accès à cette page avec votre rôle actuel ({utilisateur.role.replace(/_/g, ' ')}).
        </p>
      </div>
    );
  }

  return children;
}
