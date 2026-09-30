// src/components/Bouton.jsx
//
// Bouton réutilisé partout dans l'app, avec quelques variantes de style.

export default function Bouton({ children, variante = 'primaire', type = 'button', onClick, disabled, className = '' }) {
  const stylesBase = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variantes = {
    primaire: 'bg-blue-600 text-white hover:bg-blue-700',
    secondaire: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    succes: 'bg-green-600 text-white hover:bg-green-700',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${stylesBase} ${variantes[variante]} ${className}`}
    >
      {children}
    </button>
  );
}
