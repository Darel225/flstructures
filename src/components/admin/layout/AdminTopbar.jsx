import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { MenuIcon, ExternalLinkIcon, LogoutIcon } from '../icons/AdminIcons'
import { useAuthStore } from '../../../store/authStore'
import { useUIStore } from '../../../store/uiStore'
import { authService } from '../../../services/api/authService'
import AdminBreadcrumbs from './AdminBreadcrumbs'

export default function AdminTopbar() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const toggleMobileSidebar = useUIStore((state) => state.toggleMobileSidebar)

  const displayName =
    user?.nom || user?.name || (user?.email ? user.email.split('@')[0] : 'Administrateur')
  const userEmail = user?.email || 'admin@fl-structures.ci'
  const roleLabel = (user?.role || 'admin').toUpperCase()

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // Ignorer l'erreur réseau lors de la déconnexion
    } finally {
      clearSession()
      queryClient.clear()
      toast.success('Déconnexion effectuée avec succès.')
      navigate('/connexion', { replace: true })
    }
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#F8F6F4]/95 border-b border-[#E8E4DF] px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* 1. Zone Gauche : Burger mobile + Fil d'Ariane */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Burger Button pour mobile */}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          aria-label="Ouvrir le menu de navigation"
          className="lg:hidden p-2 -ml-2 rounded-xl text-[#555555] hover:text-[#111111] hover:bg-white transition-colors"
        >
          <MenuIcon size={20} />
        </button>

        {/* Fil d'Ariane dynamique */}
        <AdminBreadcrumbs />
      </div>

      {/* 2. Zone Droite : Raccourci Site Public & Profil Administrateur */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Bouton "Voir le site public" */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-[12.5px] font-medium text-[#111111] bg-white hover:bg-[#F8F6F4] border border-[#E8E4DF] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          title="Consulter le site vitrine dans un nouvel onglet"
        >
          <span>Voir le site</span>
          <ExternalLinkIcon size={13} className="text-[#777777] shrink-0" />
        </Link>

        {/* Séparateur vertical discret */}
        <div className="hidden sm:block h-6 w-px bg-[#E8E4DF]" aria-hidden="true" />

        {/* Bloc Profil Utilisateur */}
        <div className="flex items-center gap-3">
          {/* Avatar avec initiales */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#111111] text-white font-serif text-sm font-normal shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>

          {/* Informations Agent & Rôle */}
          <div className="hidden md:flex flex-col text-left">
            <span className="text-[13px] font-semibold text-[#111111] truncate max-w-[150px]">
              {displayName}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wider uppercase bg-[#C0392B]/10 text-[#C0392B] border border-[#C0392B]/20">
                {roleLabel}
              </span>
              <span className="text-[11.5px] text-[#777777] truncate max-w-[120px]" title={userEmail}>
                {userEmail}
              </span>
            </div>
          </div>

          {/* Bouton de déconnexion rapide */}
          <button
            type="button"
            onClick={handleLogout}
            title="Se déconnecter"
            aria-label="Se déconnecter"
            className="p-2 rounded-xl text-[#777777] hover:text-[#C0392B] hover:bg-[#FDF2F0] transition-colors"
          >
            <LogoutIcon size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
