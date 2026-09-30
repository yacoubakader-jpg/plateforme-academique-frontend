// src/components/BarreRecherche.jsx

export default function BarreRecherche({ valeur, onChange, placeholder = 'Rechercher...' }) {
  return (
    <input
      type="text"
      value={valeur}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm w-full sm:w-64"
    />
  );
}
