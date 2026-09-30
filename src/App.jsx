// src/App.jsx
//
// Assemble toutes les pages via React Router, exactement comme
// index.js assemble les routes du backend. RouteProtegee joue le
// même rôle que le middleware verifierAuthentification/autoriserRoles.

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import RouteProtegee from './components/RouteProtegee';
import BarreNavigation from './components/BarreNavigation';

import ConnexionPage from './pages/ConnexionPage';
import InscriptionPage from './pages/InscriptionPage';
import MotDePasseOubliePage from './pages/MotDePasseOubliePage';
import ReinitialiserMotDePassePage from './pages/ReinitialiserMotDePassePage';
import ChangerMotDePassePage from './pages/ChangerMotDePassePage';
import AccueilPage from './pages/AccueilPage';
import ProjetsPage from './pages/ProjetsPage';
import ProjetDetailPage from './pages/ProjetDetailPage';
import CreerProjetPage from './pages/CreerProjetPage';
import DefisPage from './pages/DefisPage';
import DefiDetailPage from './pages/DefiDetailPage';
import CreerDefiPage from './pages/CreerDefiPage';
import BadgesPage from './pages/BadgesPage';
import ProfilPage from './pages/ProfilPage';
import FavorisPage from './pages/FavorisPage';
import ClassementPage from './pages/ClassementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CandidatsPage from './pages/CandidatsPage';
import AnnoncesPage from './pages/AnnoncesPage';
import DemandesInscriptionPage from './pages/admin/DemandesInscriptionPage';
import ModerationAnnoncesPage from './pages/admin/ModerationAnnoncesPage';

function Mise_en_page({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BarreNavigation />
      {children}
    </div>
  );
}

const ROLES_ORGANISATION = ['professeur', 'representant_entreprise', 'admin_plateforme'];

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Routes publiques */}
          <Route path="/connexion" element={<ConnexionPage />} />
          <Route path="/inscription" element={<InscriptionPage />} />
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOubliePage />} />
          <Route path="/reinitialiser-mot-de-passe" element={<ReinitialiserMotDePassePage />} />

          {/* Routes protégées : connexion requise */}
          <Route path="/changer-mot-de-passe" element={
            <RouteProtegee><ChangerMotDePassePage /></RouteProtegee>
          } />

          <Route path="/" element={
            <RouteProtegee><Mise_en_page><AccueilPage /></Mise_en_page></RouteProtegee>
          } />

          <Route path="/projets" element={
            <RouteProtegee><Mise_en_page><ProjetsPage /></Mise_en_page></RouteProtegee>
          } />
          <Route path="/projets/nouveau" element={
            <RouteProtegee rolesAutorises={['etudiant']}><Mise_en_page><CreerProjetPage /></Mise_en_page></RouteProtegee>
          } />
          <Route path="/projets/:id" element={
            <RouteProtegee><Mise_en_page><ProjetDetailPage /></Mise_en_page></RouteProtegee>
          } />

          <Route path="/defis" element={
            <RouteProtegee><Mise_en_page><DefisPage /></Mise_en_page></RouteProtegee>
          } />
          <Route path="/defis/nouveau" element={
            <RouteProtegee rolesAutorises={['professeur', 'representant_entreprise']}>
              <Mise_en_page><CreerDefiPage /></Mise_en_page>
            </RouteProtegee>
          } />
          <Route path="/defis/:id" element={
            <RouteProtegee><Mise_en_page><DefiDetailPage /></Mise_en_page></RouteProtegee>
          } />

          <Route path="/badges" element={
            <RouteProtegee><Mise_en_page><BadgesPage /></Mise_en_page></RouteProtegee>
          } />
          <Route path="/profil" element={
            <RouteProtegee><Mise_en_page><ProfilPage /></Mise_en_page></RouteProtegee>
          } />
          <Route path="/favoris" element={
            <RouteProtegee><Mise_en_page><FavorisPage /></Mise_en_page></RouteProtegee>
          } />
          <Route path="/classement" element={
            <RouteProtegee><Mise_en_page><ClassementPage /></Mise_en_page></RouteProtegee>
          } />

          <Route path="/annonces" element={
            <RouteProtegee><Mise_en_page><AnnoncesPage /></Mise_en_page></RouteProtegee>
          } />

          <Route path="/analytics" element={
            <RouteProtegee rolesAutorises={ROLES_ORGANISATION}>
              <Mise_en_page><AnalyticsPage /></Mise_en_page>
            </RouteProtegee>
          } />
          <Route path="/candidats" element={
            <RouteProtegee rolesAutorises={ROLES_ORGANISATION}>
              <Mise_en_page><CandidatsPage /></Mise_en_page>
            </RouteProtegee>
          } />

          <Route path="/admin/demandes" element={
            <RouteProtegee rolesAutorises={['admin_plateforme']}>
              <Mise_en_page><DemandesInscriptionPage /></Mise_en_page>
            </RouteProtegee>
          } />
          <Route path="/admin/annonces" element={
            <RouteProtegee rolesAutorises={['admin_plateforme']}>
              <Mise_en_page><ModerationAnnoncesPage /></Mise_en_page>
            </RouteProtegee>
          } />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
