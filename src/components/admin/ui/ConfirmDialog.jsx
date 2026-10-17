import { useEffect } from 'react'
import { AlertTriangleIcon, AlertCircleIcon, InfoIcon, CloseIcon } from '../icons/AdminIcons'

/**
 * Variantes graphiques de la modale de confirmation.
 */
const VARIANT_CONFIG = {
  danger: {
    icon: AlertTriangleIcon,
    iconWrapper: 'bg-[#C0392B]/10 text-[#C0392B] border border-[#C0392B]/20',
    button:
      'bg-[#C0392B] hover:bg-[#A93226] text-white focus:ring-[#C0392B]/30 shadow-2xs',
  },
  warning: {
    icon: AlertCircleIcon,
    iconWrapper: 'bg-amber-500/10 text-amber-700 border border-amber-500/20',
    button:
      'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500/30 shadow-2xs',
  },
  info: {
    icon: InfoIcon,
    iconWrapper: 'bg-blue-600/10 text-blue-700 border border-blue-600/20',
    button:
      'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/30 shadow-2xs',
  },
}

/**
 * Modale de confirmation accessible pour actions critiques.
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
  isLoading = false,
}) {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.danger
  const Icon = config.icon

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen, onClose, isLoading])

  if (!isOpen) return null

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
    >
      {/* 1. Voile d'arrière-plan léger (noir à 30 %) */}
      <div
        onClick={isLoading ? undefined : onClose}
        className="fixed inset-0 bg-black/30 transition-opacity animate-in fade-in"
        aria-hidden="true"
      />

      {/* 2. Boîte modale centrée (rounded-2xl) */}
      <div className="relative w-full max-w-[450px] bg-white rounded-2xl border border-[#E8E4DF] shadow-xl p-6 overflow-hidden animate-in zoom-in-95 duration-200 select-text">
        {/* Bouton de fermeture */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Fermer la boîte de dialogue"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#777777] hover:text-[#111111] hover:bg-[#F8F6F4] transition-colors disabled:opacity-40"
        >
          <CloseIcon size={18} />
        </button>

        <div className="flex items-start gap-4">
          {/* Icône de la variante */}
          <div
            className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${config.iconWrapper}`}
          >
            <Icon size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <h3
              id="dialog-title"
              className="text-[17px] font-semibold text-[#111111]"
            >
              {title}
            </h3>

            <div
              id="dialog-description"
              className="mt-2 text-[13.5px] text-[#555555] leading-relaxed"
            >
              {message}
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-10 px-4 rounded-xl text-[13px] font-medium text-[#111111] hover:bg-[#F8F6F4] border border-[#E8E4DF] bg-white transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl text-[13px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed ${config.button}`}
          >
            {isLoading && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
