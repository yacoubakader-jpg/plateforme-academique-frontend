// src/context/AuthContext.jsx
//
// Garde en mémoire, pour toute l'application, qui est connecté et
// avec quel rôle. Évite d'avoir à relire localStorage dans chaque page.
//
// Utilisation dans un composant : const { utilisateur, seConnecter, seDeconnecter } = useAuth();

import { createContext, useContext, useState } from 'react';
import { connexion as apiConnexion } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(() => {
    const stocke = localStorage.getItem('utilisateur');
    return stocke ? JSON.parse(stocke) : null;
  });

  async function seConnecter(email, motDePasse) {
    const reponse = await apiConnexion(email, motDePasse);
    localStorage.setItem('token', reponse.token);
    localStorage.setItem('utilisateur', JSON.stringify(reponse.utilisateur));
    setUtilisateur(reponse.utilisateur);
    return reponse; // contient aussi doitChangerMotDePasse
  }

  function seDeconnecter() {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    setUtilisateur(null);
  }

  return (
    <AuthContext.Provider value={{ utilisateur, seConnecter, seDeconnecter }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexte = useContext(AuthContext);
  if (!contexte) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un <AuthProvider>');
  }
  return contexte;
}
