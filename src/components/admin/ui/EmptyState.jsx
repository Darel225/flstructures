import { PlusIcon, AlertCircleIcon } from '../icons/AdminIcons'

/**
 * Composant d'état vide réutilisable pour tableaux, panneaux et listes.
 */
export default function EmptyState({
  icon: Icon = AlertCircleIcon,
  title = 'Aucune donnée disponible',
  description = 'Il n’y a aucun élément correspondant à vos critères pour le moment.',
  actionLabel,
  onAction,
  actionIcon: ActionIcon = PlusIcon,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
      {/* Conteneur d'icône stylisé */}
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#F8F6F4] border border-[#E8E4DF] text-[#777777] mb-3">
        <Icon size={22} strokeWidth={1.5} />
      </div>

      {/* Titre */}
      <h3 className="text-[15px] font-semibold text-[#111111]">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="mt-1 text-[13.5px] text-[#555555] max-w-sm">
          {description}
        </p>
      )}

      {/* Bouton d'action optionnel */}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-xl text-[13px] font-medium text-white bg-[#C0392B] hover:bg-[#A93226] shadow-[0_1px_2px_rgba(192,57,43,0.15)] transition-all focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30"
        >
          <ActionIcon size={15} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  )
}
