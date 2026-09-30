// src/context/ThemeContext.jsx
//
// Gère le thème clair/sombre pour toute l'application, via la stratégie
// "class" de Tailwind : on ajoute/retire la classe "dark" sur <html>,
// et toutes les classes dark:... des composants s'activent en cascade.
// Le choix est mémorisé dans localStorage pour persister entre visites.

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeSombre, setThemeSombre] = useState(() => {
    const stocke = localStorage.getItem('theme');
    if (stocke) return stocke === 'sombre';
    // Respecte la préférence système si rien n'est mémorisé
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeSombre);
    localStorage.setItem('theme', themeSombre ? 'sombre' : 'clair');
  }, [themeSombre]);

  function basculerTheme() {
    setThemeSombre((v) => !v);
  }

  return (
    <ThemeContext.Provider value={{ themeSombre, basculerTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const contexte = useContext(ThemeContext);
  if (!contexte) throw new Error('useTheme doit être utilisé à l\'intérieur d\'un <ThemeProvider>');
  return contexte;
}
