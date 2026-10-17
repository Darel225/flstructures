import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '../store/authStore'

/**
 * Garde de route pour l'espace d'administration.
 * Vérifie la présence du token en mémoire vive et le rôle 'admin'.
 * @param {{ children?: import('react').ReactNode }} props
 */
export default function AdminGuard({ children }) {
  const location = useLocation()
  const accessToken = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)

  const isAuthenticated = Boolean(accessToken)
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    // Si l'utilisateur est authentifié mais n'a pas le rôle admin requis
    if (isAuthenticated && !isAdmin) {
      toast.error("Accès restreint : droits d'administrateur requis.")
    }
  }, [isAuthenticated, isAdmin])

  // 1. Non authentifié : Redirection vers /connexion avec mémorisation de l'URL d'origine
  if (!isAuthenticated) {
    return <Navigate to="/connexion" state={{ from: location }} replace />
  }

  // 2. Connecté mais rôle insuffisant : Redirection vers l'accueil public
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  // 3. Authentifié et autorisé : Affichage de la page protégée
  return children ? children : <Outlet />
}

