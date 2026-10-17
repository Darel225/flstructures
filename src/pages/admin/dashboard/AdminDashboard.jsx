import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../../store/authStore'
import {
  DevisIcon,
  ReservationsIcon,
  ProduitsIcon,
  ResidencesIcon,
  ClockIcon,
  ChevronRightIcon,
  PlusIcon,
  PartenairesIcon,
  ContactsIcon,
  SettingsIcon,
  CheckIcon,
  LoaderIcon,
} from '../../../components/admin/icons/AdminIcons'
import { getDashboardData } from '../../../services/api/dashboard.service'

/**
 * Helper de configuration des alertes par type
 */
const getAlertConfig = (type) => {
  const normalized = String(type || '').toUpperCase()
  if (normalized.includes('DEVIS')) {
    return {
      label: 'DEVIS',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
      iconClass: 'text-amber-700 bg-amber-50 border-amber-200',
      Icon: DevisIcon,
      defaultLink: '/admin/crm/devis',
    }
  }
  if (
    normalized.includes('HEBERGEMENT') ||
    normalized.includes('HÉBERGEMENT') ||
    normalized.includes('RESERVATION')
  ) {
    return {
      label: 'HÉBERGEMENT',
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-200/80',
      iconClass: 'text-blue-700 bg-blue-50 border-blue-200',
      Icon: ReservationsIcon,
      defaultLink: '/admin/crm/hebergements',
    }
  }
  if (normalized.includes('PARTENAIRE') || normalized.includes('FOURNISSEUR')) {
    return {
      label: 'PARTENAIRE',
      badgeClass: 'bg-purple-50 text-purple-800 border-purple-200/80',
      iconClass: 'text-purple-700 bg-purple-50 border-purple-200',
      Icon: PartenairesIcon,
      defaultLink: '/admin/crm/partenaires',
    }
  }
  // Par défaut : CONTACT
  return {
    label: 'CONTACT',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    iconClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    Icon: ContactsIcon,
    defaultLink: '/admin/crm/contacts',
  }
}

/**
 * Formatage de la date pour le flux d'alertes : "Reçu le jj mmm, hh:mm"
 */
const formatAlertDate = (dateString) => {
  if (!dateString) return ''
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    const formatted = d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
    return `Reçu le ${formatted}`
  } catch {
    return dateString
  }
}

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user)
  const displayName =
    user?.nom || user?.name || (user?.email ? user.email.split('@')[0] : 'Administrateur')

  // Chargement des données réelles du Dashboard unifié avec réactivité maximale (0 ms)
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getDashboardData,
    staleTime: 0, // Les données sont immédiatement considérées fraîches à la demande
    refetchOnMount: 'always', // Rafraîchissement forcé dès qu'on arrive sur le Dashboard
    refetchOnWindowFocus: true, // Rafraîchissement dès qu'on revient sur l'onglet
    refetchInterval: 3000, // Polling temps réel toutes les 3 secondes en arrière-plan
  })

  const counts = dashboard?.counts || dashboard || {}
  const alerts = dashboard?.recent_alerts || dashboard?.alerts || []

  const devisPending = counts.devis_pending ?? 0
  const reservationsPending = counts.reservations_pending ?? 0
  const hebergementsTotal = counts.hebergements_total ?? 3
  const produitsTotal = counts.produits_total ?? 6

  // Configuration dynamique des 4 Cartes KPI
  const KPI_METRICS = [
    {
      id: 'devis',
      title: 'Devis Structures en attente',
      value: String(devisPending),
      change:
        devisPending > 0
          ? `${devisPending} demande(s) minière(s) à instruire`
          : 'Toutes les cotations sont traitées',
      hasAlert: devisPending > 0,
      isUpToDate: devisPending === 0,
      badgeText: devisPending > 0 ? 'À traiter' : 'À jour',
      badgeClass:
        devisPending > 0
          ? 'bg-amber-50 text-amber-800 border-amber-200'
          : 'bg-emerald-50 text-emerald-800 border-emerald-200',
      to: '/admin/crm/devis',
      icon: DevisIcon,
    },
    {
      id: 'hebergements',
      title: 'Réservations Hébergements',
      value: String(reservationsPending),
      change:
        reservationsPending > 0
          ? `${reservationsPending} séjour(s) cadres & VIP à confirmer`
          : 'Toutes les réservations sont traitées',
      hasAlert: reservationsPending > 0,
      isUpToDate: reservationsPending === 0,
      badgeText: reservationsPending > 0 ? 'À traiter' : 'À jour',
      badgeClass:
        reservationsPending > 0
          ? 'bg-amber-50 text-amber-800 border-amber-200'
          : 'bg-emerald-50 text-emerald-800 border-emerald-200',
      to: '/admin/crm/hebergements',
      icon: ReservationsIcon,
    },
    {
      id: 'sites',
      title: 'Bases-Vie & Complexes gérés',
      value: String(hebergementsTotal),
      change: `${hebergementsTotal} complexes & bases-vie opérationnels`,
      hasAlert: false,
      isUpToDate: false,
      badgeText: 'Actifs',
      badgeClass: 'bg-[#FAF8F6] text-[#555555] border-[#E8E4DF]',
      to: '/admin/hebergements',
      icon: ResidencesIcon,
    },
    {
      id: 'produits',
      title: 'Structures au Catalogue',
      value: String(produitsTotal),
      change: `${produitsTotal} modules, shelters & hangars`,
      hasAlert: false,
      isUpToDate: false,
      badgeText: 'Catalogue B2B',
      badgeClass: 'bg-[#FAF8F6] text-[#555555] border-[#E8E4DF]',
      to: '/admin/catalog/produits',
      icon: ProduitsIcon,
    },
  ]

  // Raccourcis d'actions rapides
  const QUICK_SHORTCUTS = [
    {
      label: 'Ajouter un Produit',
      subtitle: 'Nouveau module ou shelter',
      to: '/admin/catalog/produits',
      icon: PlusIcon,
    },
    {
      label: 'Nouveau Complexe Hôtelier',
      subtitle: 'Ajouter une base-vie ou résidence',
      to: '/admin/hebergements',
      icon: ResidencesIcon,
    },
    {
      label: 'Modifier la Mercuriale',
      subtitle: 'Mettre à jour le PDF officiel',
      to: '/admin/settings',
      icon: SettingsIcon,
    },
    {
      label: 'Candidatures Partenaires',
      subtitle: 'Fournisseurs fret, levage & BTP',
      to: '/admin/crm/partenaires',
      icon: PartenairesIcon,
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. EN-TÊTE DE BIENVENUE EXÉCUTIF */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8E4DF]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1E824C]/10 text-[#1E824C] text-[11.5px] font-semibold border border-[#1E824C]/20 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E824C]" />
            <span>Poste de Commandement FL Structures B2B</span>
          </div>
          <h1 className="fl-admin-title-page">
            Bonjour, <span className="text-[#C0392B]">{displayName}</span>
          </h1>
          <p className="text-[14px] text-[#555555] mt-1">
            Supervisez en direct les demandes de devis miniers, les occupations de bases-vie et les opérations du catalogue.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-2 text-[12.5px] text-[#555555] bg-white border border-[#E8E4DF] px-3.5 py-2 rounded-xl shadow-2xs tabular-nums">
            <ClockIcon size={14} className="text-[#C0392B]" />
            <span>
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </span>
        </div>
      </div>

      {/* 2. GRILLE DES 4 KPI CONNECTÉS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {KPI_METRICS.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Link
              key={kpi.id}
              to={kpi.to}
              className="group bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E4DF] shadow-2xs hover:border-[#C0392B]/50 hover:shadow-sm transition-all duration-200 block relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#777777] line-clamp-1">
                  {kpi.title}
                </span>
                <div className="p-2 rounded-xl bg-[#FAF8F6] border border-[#E8E4DF] text-[#777777] group-hover:text-[#111111] transition-colors shrink-0">
                  <Icon size={18} />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2.5">
                <span className="font-serif text-[38px] sm:text-[42px] font-normal text-[#111111] tabular-nums leading-none">
                  {kpi.value}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${kpi.badgeClass}`}
                >
                  {kpi.hasAlert && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  )}
                  {kpi.isUpToDate && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                  {kpi.badgeText}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E8E4DF] flex items-center justify-between text-[12.5px] text-[#777777]">
                <span className="truncate">{kpi.change}</span>
                <ChevronRightIcon
                  size={14}
                  className="text-[#8A8580] group-hover:text-[#C0392B] group-hover:translate-x-0.5 transition-all"
                />
              </div>
            </Link>
          )
        })}
      </div>

      {/* 3. BARRE D'ACTIONS RAPIDES */}
      <div className="space-y-3">
        <h2 className="fl-admin-title-section">
          Raccourcis Opérationnels
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {QUICK_SHORTCUTS.map((shortcut) => {
            const Icon = shortcut.icon
            return (
              <Link
                key={shortcut.label}
                to={shortcut.to}
                className="p-4 rounded-2xl bg-white border border-[#E8E4DF] shadow-2xs hover:bg-[#FAF8F6] hover:border-[#C0392B]/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF8F6] border border-[#E8E4DF] text-[#777777] group-hover:text-[#C0392B] group-hover:border-[#C0392B]/30 flex items-center justify-center transition-colors shrink-0">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[13.5px] font-semibold text-[#111111] block truncate group-hover:text-[#C0392B] transition-colors">
                      {shortcut.label}
                    </span>
                    <span className="text-[12px] text-[#777777] block truncate">
                      {shortcut.subtitle}
                    </span>
                  </div>
                </div>
                <ChevronRightIcon
                  size={15}
                  className="text-[#8A8580] group-hover:translate-x-1 transition-transform shrink-0"
                />
              </Link>
            )
          })}
        </div>
      </div>

      {/* 4. TABLEAU DES DERNIÈRES ALERTES URGENTES */}
      <div className="w-full bg-white rounded-2xl border border-[#E8E4DF] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#E8E4DF] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#C0392B] animate-pulse" />
            <div>
              <h3 className="text-[16px] font-semibold text-[#111111]">
                Dernières Alertes Urgentes (Leads non traités)
              </h3>
              <p className="text-[13px] text-[#555555] mt-0.5">
                Flux entrants nécessitant un retour ou une affectation commerciale immédiate.
              </p>
            </div>
          </div>

          <Link
            to="/admin/crm/devis"
            className="text-[13px] font-semibold text-[#C0392B] hover:underline hidden sm:inline-flex items-center gap-1"
          >
            Voir le CRM complet
            <ChevronRightIcon size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-[#777777] flex flex-col items-center justify-center gap-3">
            <LoaderIcon size={24} className="animate-spin text-[#C0392B]" />
            <span className="text-sm">Synchronisation des alertes en temps réel...</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto shadow-2xs">
              <CheckIcon size={22} />
            </div>
            <p className="text-[15px] font-bold text-[#111111]">
              Toutes les alertes sont traitées. Aucun dossier en attente.
            </p>
            <p className="text-[13px] text-[#777777] max-w-md mx-auto">
              Les demandes de devis, réservations, candidatures partenaires et messages de contact sont à jour.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E4DF]">
            {alerts.map((item, idx) => {
              const config = getAlertConfig(item.kind || item.type)
              const Icon = config.Icon
              const title =
                item.title || item.societe || item.nom_contact || item.nom || 'Dossier entrant'
              const subtitle =
                item.subtitle || item.besoin || item.type_service || item.sujet || item.message
              const contact =
                item.contact || item.contact_nom || item.nom_contact || item.email || item.telephone
              const link = item.link || item.targetUrl || config.defaultLink
              const formattedDate = formatAlertDate(item.created_at || item.date)

              return (
                <div
                  key={item.id ? `${config.label}-${item.id}` : `alert-${idx}`}
                  className="p-4 sm:px-6 hover:bg-[#FAF8F6] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${config.iconClass}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px] font-bold text-[#111111] truncate">
                          {title}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${config.badgeClass}`}
                        >
                          {config.label}
                        </span>
                      </div>
                      {subtitle && (
                        <p className="text-[13px] text-[#555555] mt-1 line-clamp-1">
                          {subtitle}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-[12px] text-[#777777] mt-1 flex-wrap">
                        {contact && (
                          <span>
                            Contact :{' '}
                            <strong className="font-semibold text-[#222222]">{contact}</strong>
                          </span>
                        )}
                        {contact && formattedDate && <span>•</span>}
                        {formattedDate && (
                          <span className="tabular-nums font-mono text-[11px] text-[#888888]">
                            {formattedDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={link}
                    className="inline-flex items-center gap-1.5 h-9 px-4 bg-white hover:bg-[#FAF8F6] text-[#111111] hover:text-[#C0392B] border border-[#E8E4DF] hover:border-[#C0392B]/40 rounded-xl text-[12.5px] font-semibold transition-colors shrink-0 self-end sm:self-auto shadow-2xs group"
                  >
                    <span>Traiter le dossier</span>
                    <ChevronRightIcon
                      size={14}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
