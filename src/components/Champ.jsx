// src/components/Champ.jsx
//
// Input de formulaire standardisé (label + champ + message d'erreur).

export default function Champ({ label, type = 'text', value, onChange, requis, placeholder, erreur, className = '', ...reste }) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {requis && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={requis}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${erreur ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
        {...reste}
      />
      {erreur && <p className="text-red-500 text-sm mt-1">{erreur}</p>}
    </div>
  );
}
