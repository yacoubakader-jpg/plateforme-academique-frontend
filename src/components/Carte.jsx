// src/components/Carte.jsx
//
// Conteneur visuel réutilisé pour toutes les "cartes" de l'app
// (un projet, un défi, une équipe...).

export default function Carte({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {children}
    </div>
  );
}
