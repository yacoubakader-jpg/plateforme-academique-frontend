// src/components/Alerte.jsx
//
// Message d'erreur ou de succès affiché en haut d'un formulaire.

export default function Alerte({ type = 'erreur', message }) {
  if (!message) return null;

  const styles = type === 'erreur'
    ? 'bg-red-50 text-red-700 border-red-200'
    : 'bg-green-50 text-green-700 border-green-200';

  return (
    <div className={`border rounded-lg px-4 py-3 mb-4 text-sm ${styles}`}>
      {message}
    </div>
  );
}
