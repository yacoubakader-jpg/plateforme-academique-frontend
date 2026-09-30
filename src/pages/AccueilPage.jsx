// src/pages/AccueilPage.jsx

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Carte from '../components/Carte';
import CarrouselAnnonces from '../components/CarrouselAnnonces';

export default function AccueilPage() {
  const { utilisateur } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
        Bienvenue, {utilisateur.prenom} 👋
      </h1>
      <p className="text-gray-500 mb-8">
        Plateforme de mise en relation académique inter-universitaire
      </p>

      <CarrouselAnnonces />

      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/projets">
          <Carte className="hover:shadow-md transition-shadow cursor-pointer">
            <h2 className="font-medium text-gray-900 dark:text-white mb-1">Projets étudiants</h2>
            <p className="text-sm text-gray-500">Trouvez des coéquipiers ou proposez votre aide</p>
          </Carte>
        </Link>
        <Link to="/defis">
          <Carte className="hover:shadow-md transition-shadow cursor-pointer">
            <h2 className="font-medium text-gray-900 dark:text-white mb-1">Défis</h2>
            <p className="text-sm text-gray-500">Participez à des compétitions inter-universités</p>
          </Carte>
        </Link>
        <Link to="/badges">
          <Carte className="hover:shadow-md transition-shadow cursor-pointer">
            <h2 className="font-medium text-gray-900 dark:text-white mb-1">Mes badges</h2>
            <p className="text-sm text-gray-500">Consultez votre portfolio de certifications</p>
          </Carte>
        </Link>
        {['professeur', 'representant_entreprise', 'admin_plateforme'].includes(utilisateur.role) && (
          <>
            <Link to="/analytics">
              <Carte className="hover:shadow-md transition-shadow cursor-pointer">
                <h2 className="font-medium text-gray-900 dark:text-white mb-1">Tableau de bord</h2>
                <p className="text-sm text-gray-500">Statistiques de votre organisation</p>
              </Carte>
            </Link>
            <Link to="/candidats">
              <Carte className="hover:shadow-md transition-shadow cursor-pointer">
                <h2 className="font-medium text-gray-900 dark:text-white mb-1">Répertoire de candidats</h2>
                <p className="text-sm text-gray-500">Recherchez des étudiants par compétences</p>
              </Carte>
            </Link>
          </>
        )}
        {utilisateur.role === 'admin_plateforme' && (
          <Link to="/admin/demandes">
            <Carte className="hover:shadow-md transition-shadow cursor-pointer">
              <h2 className="font-medium text-gray-900 dark:text-white mb-1">Demandes d'inscription</h2>
              <p className="text-sm text-gray-500">Validez les nouveaux comptes</p>
            </Carte>
          </Link>
        )}
      </div>
    </div>
  );
}
