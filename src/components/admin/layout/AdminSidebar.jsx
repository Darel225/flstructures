import { NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  DashboardIcon,
  DevisIcon,
  ReservationsIcon,
  PartenairesIcon,
  ContactsIcon,
  ProduitsIcon,
  CategoriesIcon,
  ResidencesIcon,
  EquipementsIcon,
  ProjetsIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
} from '../icons/AdminIcons'
import { useUIStore } from '../../../store/uiStore'
import crmService from '../../../services/api/crm.service'

/**
 * Configuration des groupes de navigation du back-office.
 */
const NAVIGATION_GROUPS = [
  {
    title: "VUE D'ENSEMBLE",
    items: [
      {
        label: 'Dashboard',
        to: '/admin',
        end: true,
        icon: DashboardIcon,
      },
    ],
  },
  {
    title: 'DEMANDES & CRM',
    items: [
      {
        label: 'Devis Structures',
        to: '/admin/crm/devis',
        icon: DevisIcon,
        badge: '3',
      },
      {
        label: 'Réservations Séjours',
        to: '/admin/crm/hebergements',
        icon: ReservationsIcon,
      },
      {
        label: 'Partenaires',
        to: '/admin/crm/partenaires',
        icon: PartenairesIcon,
        badge: 'New',
      },
      {
        label: 'Contacts',
        to: '/admin/crm/contacts',
        icon: ContactsIcon,
      },
    ],
  },
  {
    title: 'CATALOGUE MODULAIRE',
    items: [
      {
        label: 'Produits',
        to: '/admin/catalog/produits',
        icon: ProduitsIcon,
      },
      {
        label: 'Catégories',
        to: '/admin/catalog/categories',
        icon: CategoriesIcon,
      },
    ],
  },
  {
    title: 'HÉBERGEMENTS',
    items: [
      {
        label: 'Bases-vie & Résidences',
        to: '/admin/hebergements',
        end: true,
        icon: ResidencesIcon,
      },
      {
        label: 'Équipements',
        to: '/admin/hebergements/equipements',
        end: true,
        icon: EquipementsIcon,
      },
    ],
  },
  {
    title: 'RÉALISATIONS',
    items: [
      {
        label: 'Projets & Chantiers',
        to: '/admin/realisations',
        icon: ProjetsIcon,
      },
    ],
  },
  {
    title: 'CONFIGURATION',
    items: [
      {
        label: 'Paramètres Généraux',
        to: '/admin/settings',
        icon: SettingsIcon,
      },
    ],
  },
]

export default function AdminSidebar() {
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const isMobileSidebarOpen = useUIStore((state) => state.isMobileSidebarOpen)
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen)

  // Récupération dynamique des compteurs de demandes CRM en attente (réactivité instantanée)
  const { data: crmCounts = {} } = useQuery({
    queryKey: ['crm-counts'],
    queryFn: () => crmService.getCrmCounts(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 3000,
  })

  const devisCount = crmCounts?.devis_pending ?? crmCounts?.devis ?? 0
  const reservationsCount = crmCounts?.reservations_pending ?? crmCounts?.hebergements_pending ?? crmCounts?.hebergements ?? 0
  const partenairesCount = crmCounts?.partenaires_pending ?? crmCounts?.partenaires ?? 0
  const contactsCount = crmCounts?.contacts_pending ?? crmCounts?.contacts ?? 0

  const getItemBadge = (to, staticBadge) => {
    if (to === '/admin/crm/devis') return devisCount > 0 ? String(devisCount) : null
    if (to === '/admin/crm/hebergements') return reservationsCount > 0 ? String(reservationsCount) : null
    if (to === '/admin/crm/partenaires') return partenairesCount > 0 ? String(partenairesCount) : null
    if (to === '/admin/crm/contacts') return contactsCount > 0 ? String(contactsCount) : null
    return staticBadge
  }

  const handleLinkClick = () => {
    if (isMobileSidebarOpen) {
      setMobileSidebarOpen(false)
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-[#111111] border-r border-[#E8E4DF] select-none">
      {/* 1. Header Sidebar : Logo / Marque & Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#E8E4DF] shrink-0 bg-white">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Logo badge FL */}
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#F8F6F4] border border-[#E8E4DF] shrink-0">
            <span className="font-heading font-black text-sm text-[#111111]">
              FL<span className="text-[#C0392B]">.</span>
            </span>
          </div>

          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-200">
              <span className="font-heading font-bold text-sm tracking-tight text-[#111111] truncate">
                FL STRUCTURES
              </span>
              <span className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[#C0392B]">
                Administration
              </span>
            </div>
          )}
        </div>

        {/* Bouton de repli pour desktop */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? 'Déplier le menu' : 'Rétracter le menu'}
          title={isSidebarCollapsed ? 'Déplier le menu (260px)' : 'Rétracter le menu (80px)'}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-[#777777] hover:text-[#111111] hover:bg-[#F8F6F4] transition-colors"
        >
          {isSidebarCollapsed ? <ChevronRightIcon size={16} /> : <ChevronLeftIcon size={16} />}
        </button>

        {/* Bouton fermeture sur mobile */}
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Fermer le menu"
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-[#777777] hover:text-[#111111] hover:bg-[#F8F6F4] transition-colors"
        >
          <CloseIcon size={18} />
        </button>
      </div>

      {/* 2. Navigation défilante */}
      <nav
        aria-label="Menu principal d'administration"
        className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-5"
      >
        {NAVIGATION_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            {/* Titre de section avec badge total agrégé */}
            {!isSidebarCollapsed ? (
              <div className="flex items-center justify-between px-3 py-1">
                <h3 className="text-[11.5px] font-semibold uppercase tracking-wider text-[#8A8580]">
                  {group.title}
                </h3>
                {group.title === 'DEMANDES & CRM' && (crmCounts?.total || 0) > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[11px] font-bold bg-[#C0392B]/10 text-[#C0392B] border border-[#C0392B]/20">
                    {crmCounts.total}
                  </span>
                )}
              </div>
            ) : (
              <div className="relative my-2 mx-2">
                <div
                  className="h-px bg-[#E8E4DF]"
                  title={group.title}
                  aria-hidden="true"
                />
                {group.title === 'DEMANDES & CRM' && (crmCounts?.total || 0) > 0 && (
                  <span
                    className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-[#C0392B]"
                    title={`${crmCounts.total} demandes en attente`}
                  />
                )}
              </div>
            )}

            {/* Liens de la section */}
            <ul className="space-y-0.5 list-none m-0 p-0">
              {group.items.map((item) => {
                const Icon = item.icon
                const badge = getItemBadge(item.to, item.badge)

                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end !== undefined ? item.end : true}
                      onClick={handleLinkClick}
                      title={isSidebarCollapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-xl text-[14px] transition-all duration-150 ${
                          isSidebarCollapsed
                            ? 'justify-center h-10 w-10 mx-auto'
                            : 'px-3 py-2'
                        } ${
                          isActive
                            ? 'bg-[#F8F6F4] text-[#C0392B] font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:bg-[#C0392B] before:rounded-r'
                            : 'text-[#555555] hover:text-[#111111] hover:bg-[#F8F6F4] font-medium'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={18}
                            className={`shrink-0 transition-colors duration-150 ${
                              isActive ? 'text-[#C0392B]' : 'text-[#777777] group-hover:text-[#111111]'
                            }`}
                            aria-hidden="true"
                          />

                          {!isSidebarCollapsed && (
                            <span className="truncate flex-1">{item.label}</span>
                          )}

                          {/* Badge de notification synchronisé */}
                          {badge && !isSidebarCollapsed && (
                            <span
                              className={`ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                                isActive
                                  ? 'bg-[#C0392B] text-white'
                                  : 'bg-[#F8F6F4] text-[#555555] border border-[#E8E4DF] group-hover:border-[#C0392B]/30'
                              }`}
                            >
                              {badge}
                            </span>
                          )}

                          {/* Indicateur de badge pour le mode rétracté */}
                          {badge && isSidebarCollapsed && (
                            <span
                              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C0392B]"
                              aria-label={`${badge} notifications`}
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* 3. Footer Sidebar : Statut Système */}
      <div className="p-3 border-t border-[#E8E4DF] text-[12px] text-[#777777] shrink-0 bg-white">
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1E824C]" />
              <span className="text-[#555555]">Système opérationnel</span>
            </div>
            <span className="text-[#8A8580] font-mono text-[11px]">v1.0</span>
          </div>
        ) : (
          <div className="flex justify-center" title="Système opérationnel">
            <span className="w-2 h-2 rounded-full bg-[#1E824C]" />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* 1. Sidebar Desktop permanente */}
      <aside
        aria-label="Barre latérale d'administration"
        className={`hidden lg:block shrink-0 sticky top-0 h-screen z-40 transition-[width] duration-200 ease-in-out ${
          isSidebarCollapsed ? 'w-[80px]' : 'w-[260px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* 2. Sidebar Mobile Drawer (Tiroir) avec Overlay */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Arrière-plan assombri léger */}
          <div
            className="fixed inset-0 bg-black/30 transition-opacity duration-200"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Contenu du tiroir mobile */}
          <aside
            aria-label="Menu mobile d'administration"
            className="relative w-[280px] max-w-[85vw] h-full shadow-lg z-10 animate-in slide-in-from-left duration-200"
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
