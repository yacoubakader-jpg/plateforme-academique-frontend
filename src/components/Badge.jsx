// src/components/Badge.jsx
//
// Petite étiquette colorée pour afficher un statut (ouvert, en_attente, etc.)

const COULEURS = {
  ouvert: 'bg-green-100 text-green-800',
  en_cours: 'bg-blue-100 text-blue-800',
  evaluation: 'bg-yellow-100 text-yellow-800',
  cloture: 'bg-gray-100 text-gray-700',
  en_attente: 'bg-yellow-100 text-yellow-800',
  approuvee: 'bg-green-100 text-green-800',
  acceptee: 'bg-green-100 text-green-800',
  rejetee: 'bg-red-100 text-red-800',
  refusee: 'bg-red-100 text-red-800',
};

export default function Badge({ texte }) {
  const style = COULEURS[texte] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
      {texte?.replace(/_/g, ' ')}
    </span>
  );
}
