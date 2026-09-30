// src/components/SelecteurEmoji.jsx
//
// Sélecteur d'emoji volontairement simple (liste curée d'emojis courants),
// plutôt qu'une grosse librairie tierce — évite d'alourdir le bundle pour
// une fonctionnalité somme toute légère. Suffisant pour l'usage prévu.

const EMOJIS_COURANTS = [
  '😀', '😂', '😊', '😍', '🤔', '😅', '😢', '😮', '😎', '🙌',
  '👍', '👎', '🙏', '💪', '👏', '🤝', '✋', '👋', '✅', '❌',
  '❤️', '🔥', '🎉', '🚀', '⭐', '💡', '📌', '⏰', '📎', '🎯',
  '🏆', '🎓', '📚', '💻', '🤝', '😴', '🙄', '😬', '👀', '🙏',
];

export default function SelecteurEmoji({ onSelection, onFermer }) {
  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-8 gap-1 z-50 w-64">
      {EMOJIS_COURANTS.map((emoji, i) => (
        <button
          key={`${emoji}-${i}`}
          type="button"
          onClick={() => { onSelection(emoji); onFermer(); }}
          className="text-lg hover:bg-gray-100 rounded p-1"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
