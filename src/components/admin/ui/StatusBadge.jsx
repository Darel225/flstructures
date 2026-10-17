/**
 * Dictionnaire de configuration des variantes et libellés par défaut.
 */
const STATUS_CONFIG = {
  // 1. NOUVEAU / EN ATTENTE (Bleu / Ciel)
  nouveau: {
    label: 'Nouveau',
    variant: 'info',
    pulse: true,
  },
  new: {
    label: 'Nouveau',
    variant: 'info',
    pulse: true,
  },
  en_attente: {
    label: 'En attente',
    variant: 'info',
    pulse: true,
  },
  pending: {
    label: 'En attente',
    variant: 'info',
    pulse: true,
  },

  // 2. EN COURS / CONTACTÉ / À TRAITER (Ambre)
  en_cours: {
    label: 'En cours',
    variant: 'warning',
    pulse: false,
  },
  in_progress: {
    label: 'En cours',
    variant: 'warning',
    pulse: false,
  },
  contacte: {
    label: 'Contacté',
    variant: 'warning',
    pulse: false,
  },
  a_traiter: {
    label: 'À traiter',
    variant: 'warning',
    pulse: false,
  },

  // 3. VALIDÉ / TRAITÉ / ACTIF (Émeraude)
  valide: {
    label: 'Validé',
    variant: 'success',
    pulse: false,
  },
  traite: {
    label: 'Traité',
    variant: 'success',
    pulse: false,
  },
  confirme: {
    label: 'Confirmé',
    variant: 'success',
    pulse: false,
  },
  actif: {
    label: 'Actif',
    variant: 'success',
    pulse: false,
  },
  active: {
    label: 'Actif',
    variant: 'success',
    pulse: false,
  },
  publie: {
    label: 'Publié',
    variant: 'success',
    pulse: false,
  },
  termine: {
    label: 'Livré',
    variant: 'success',
    pulse: false,
  },

  // 4. REJETÉ / ANNULÉ / INACTIF (Rouge marque)
  rejete: {
    label: 'Rejeté',
    variant: 'danger',
    pulse: false,
  },
  annule: {
    label: 'Annulé',
    variant: 'danger',
    pulse: false,
  },
  inactif: {
    label: 'Inactif',
    variant: 'danger',
    pulse: false,
  },
  inactive: {
    label: 'Inactif',
    variant: 'danger',
    pulse: false,
  },
  archive: {
    label: 'Archivé',
    variant: 'danger',
    pulse: false,
  },
  urgent: {
    label: 'Urgent',
    variant: 'danger',
    pulse: true,
  },
}

/**
 * Classes discrètes par teinte (fond teinté à ~8 % + texte lisible + filet fin + petit point)
 */
const VARIANT_STYLES = {
  info: {
    badge: 'bg-blue-600/[0.08] text-blue-900 border-blue-600/20',
    dot: 'bg-blue-600',
  },
  warning: {
    badge: 'bg-amber-600/[0.08] text-amber-900 border-amber-600/20',
    dot: 'bg-amber-600',
  },
  success: {
    badge: 'bg-emerald-600/[0.08] text-emerald-900 border-emerald-600/20',
    dot: 'bg-emerald-600',
  },
  danger: {
    badge: 'bg-[#C0392B]/[0.08] text-[#C0392B] border-[#C0392B]/20',
    dot: 'bg-[#C0392B]',
  },
  neutral: {
    badge: 'bg-[#777777]/[0.08] text-[#333333] border-[#777777]/20',
    dot: 'bg-[#777777]',
  },
}

/**
 * Pastille d'état métier discrète et lisible (Design System Admin).
 */
export default function StatusBadge({
  status,
  label,
  variant,
  className = '',
}) {
  let key = ''
  if (typeof status === 'boolean') {
    key = status ? 'actif' : 'inactif'
  } else if (typeof status === 'string') {
    key = status.trim().toLowerCase().replace(/[\s-]/g, '_')
  }

  const config = STATUS_CONFIG[key]
  const resolvedVariant = variant || config?.variant || 'neutral'
  const resolvedLabel = label || config?.label || status || 'Non défini'
  const shouldPulse = config?.pulse ?? false
  const styles = VARIANT_STYLES[resolvedVariant] || VARIANT_STYLES.neutral

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${styles.badge} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot} ${
          shouldPulse ? 'animate-pulse' : ''
        }`}
        aria-hidden="true"
      />
      <span>{resolvedLabel}</span>
    </span>
  )
}
