// src/components/Pagination.jsx
//
// Contrôles Précédent / Suivant + numéro de page, réutilisés sur
// toutes les listes paginées (projets, défis, demandes d'inscription).

export default function Pagination({ page, totalPages, onChangerPage }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <button
        onClick={() => onChangerPage(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        ← Précédent
      </button>

      <span className="text-sm text-gray-500">
        Page {page} / {totalPages}
      </span>

      <button
        onClick={() => onChangerPage(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Suivant →
      </button>
    </div>
  );
}
