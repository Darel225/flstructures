import { useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster, toast } from 'sonner'

// Providers & Sécurité
import AuthProvider from './providers/AuthProvider'
import AdminGuard from './routes/AdminGuard'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import AdminLayout from './layouts/AdminLayout'

// Pages Publiques
import Accueil from './pages/public/Accueil'
import APropos from './pages/public/APropos'
import ContactPage from './pages/public/ContactPage'
import Connexion from './pages/public/Connexion'
import Hebergement from './pages/public/Hebergement'
import MentionsLegales from './pages/public/MentionsLegales'
import Methode from './pages/public/Methode'
import NotFound from './pages/public/NotFound'
import Partenaire from './pages/public/Partenaire'
import Produits from './pages/public/Produits'
import Realisations from './pages/public/Realisations'
import Services from './pages/public/Services'

// Espace Administration
import AdminDashboard from './pages/admin/dashboard/AdminDashboard'
import UiKitShowroom from './pages/admin/sandbox/UiKitShowroom'
import DevisRequestsPage from './pages/admin/crm/DevisRequestsPage'
import HebergementRequestsPage from './pages/admin/crm/HebergementRequestsPage'
import PartenaireRequestsPage from './pages/admin/crm/PartenaireRequestsPage'
import ContactRequestsPage from './pages/admin/crm/ContactRequestsPage'
import CategoriesListPage from './pages/admin/catalog/CategoriesListPage'
import ProduitsListPage from './pages/admin/catalog/ProduitsListPage'
import EquipementsListPage from './pages/admin/hebergements/EquipementsListPage'
import HebergementsListPage from './pages/admin/hebergements/HebergementsListPage'
import RealisationsListPage from './pages/admin/realisations/RealisationsListPage'
import GlobalSettingsPage from './pages/admin/settings/GlobalSettingsPage'




// Instance unique de React Query avec configuration de mise en cache
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

export default function App() {
  const navigate = useNavigate()

  useEffect(() => {
    // Écouteur global pour expiration de session
    const handleSessionExpired = () => {
      // Uniquement si l'utilisateur est déjà dans l'espace /admin
      if (window.location.pathname.startsWith('/admin')) {
        toast.warning('Votre session a expiré. Veuillez vous reconnecter.')
        navigate('/connexion', { replace: true })
      }
    }
    window.addEventListener('auth:session_expired', handleSessionExpired)
    return () => {
      window.removeEventListener('auth:session_expired', handleSessionExpired)
    }
  }, [navigate])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Notifications Sonner globales */}
        <Toaster richColors position="top-right" />

        <Routes>
          {/* ---------------------------------------------------------------- */}
          {/* ROUTES PUBLIQUES                                                 */}
          {/* ---------------------------------------------------------------- */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Accueil />} />
            <Route path="a-propos" element={<APropos />} />
            <Route path="services" element={<Services />} />
            <Route path="produits" element={<Produits />} />
            <Route path="methode" element={<Methode />} />
            <Route path="realisations" element={<Realisations />} />
            <Route path="hebergement" element={<Hebergement />} />
            <Route path="devenir-partenaire" element={<Partenaire />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="mentions-legales" element={<MentionsLegales />} />
            <Route path="connexion" element={<Connexion />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* ---------------------------------------------------------------- */}
          {/* ESPACE ADMINISTRATION PROTÉGÉ (/admin)                           */}
          {/* ---------------------------------------------------------------- */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }
          >
            {/* Vue d'ensemble */}
            <Route index element={<AdminDashboard />} />

            {/* Demandes & CRM */}
            <Route path="crm/devis" element={<DevisRequestsPage />} />
            <Route
              path="crm/hebergements"
              element={<HebergementRequestsPage />}
            />
            <Route
              path="crm/partenaires"
              element={<PartenaireRequestsPage />}
            />
            <Route path="crm/contacts" element={<ContactRequestsPage />} />


            {/* Catalogue Modulaire */}
            <Route path="catalog/produits" element={<ProduitsListPage />} />
            <Route
              path="catalog/categories"
              element={<CategoriesListPage />}
            />

            {/* Hébergements */}
            <Route path="hebergements" element={<HebergementsListPage />} />
            <Route
              path="hebergements/equipements"
              element={<EquipementsListPage />}
            />

            {/* Réalisations */}
            <Route path="realisations" element={<RealisationsListPage />} />

            {/* Configuration */}
            <Route path="settings" element={<GlobalSettingsPage />} />

            {/* Showroom & Boîte à Outils UI */}
            <Route path="ui-kit" element={<UiKitShowroom />} />
          </Route>
        </Routes>

      </AuthProvider>
    </QueryClientProvider>
  )
}
