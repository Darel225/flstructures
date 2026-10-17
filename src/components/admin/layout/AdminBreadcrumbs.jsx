import { Link, useLocation } from 'react-router-dom'
import { ChevronRightIcon, DashboardIcon } from '../icons/AdminIcons'

/**
 * Dictionnaire de traduction des segments d'URL en libellés lisibles.
 */
const SEGMENT_LABELS = {
  admin: 'Dashboard',
  crm: 'CRM & Demandes',
  devis: 'Devis Structures',
  hebergements: 'Hébergements',
  partenaires: 'Partenaires',
  contacts: 'Contacts',
  catalog: 'Catalogue',
  produits: 'Produits',
  categories: 'Catégories',
  equipements: 'Équipements',
  realisations: 'Réalisations',
  settings: 'Configuration Globale',
  'ui-kit': 'Boîte à Outils UI',
}

/**
 * Fil d'Ariane dynamique pour l'espace d'administration.
 */
export default function AdminBreadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter(Boolean)

  return (
    <nav aria-label="Fil d'Ariane" className="hidden sm:flex items-center text-[12.5px]">
      <ol className="flex items-center gap-1.5 list-none m-0 p-0">
        <li>
          <Link
            to="/admin"
            className="flex items-center gap-1 text-[#777777] hover:text-[#111111] transition-colors"
            title="Accueil Administration"
          >
            <DashboardIcon size={14} className="shrink-0 text-[#8A8580]" />
            <span className="sr-only sm:not-sr-only font-medium">Admin</span>
          </Link>
        </li>

        {pathnames.slice(1).map((segment, index) => {
          const routeTo = `/${pathnames.slice(0, index + 2).join('/')}`
          const isLast = index === pathnames.slice(1).length - 1
          const label = SEGMENT_LABELS[segment.toLowerCase()] || decodeURIComponent(segment)

          return (
            <li key={routeTo} className="flex items-center gap-1.5">
              <ChevronRightIcon size={12} className="text-[#8A8580] shrink-0" aria-hidden="true" />
              {isLast ? (
                <span
                  className="font-semibold text-[#111111] max-w-[200px] truncate"
                  aria-current="page"
                >
                  {label}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="text-[#777777] hover:text-[#111111] transition-colors max-w-[140px] truncate"
                >
                  {label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
