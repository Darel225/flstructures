import { useEffect } from 'react'
import { CloseIcon } from '../icons/AdminIcons'

/**
 * Panneau latéral coulissant (Slide-Over Drawer) pour affichage et édition de détails.
 */
export default function SlideOverDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'sm:max-w-[580px]',
}) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
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
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="slideover-title"
      className="fixed inset-0 z-50 overflow-hidden select-none"
    >
      {/* 1. Voile d'arrière-plan léger (noir à 30 %, sans flou lourd) */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/30 transition-opacity duration-200 animate-in fade-in"
        aria-hidden="true"
      />

      {/* 2. Conteneur positionné à droite */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          className={`w-screen ${maxWidth} bg-white border-l border-[#E8E4DF] shadow-xl flex flex-col transform transition-transform duration-200 ease-in-out animate-in slide-in-from-right select-text`}
        >
          {/* En-tête du panneau - Fond blanc pur sans aplat sombre */}
          <div className="px-6 py-4 border-b border-[#E8E4DF] flex items-start justify-between gap-4 bg-white">
            <div className="min-w-0">
              <h2
                id="slideover-title"
                className="text-[18px] font-semibold text-[#111111] truncate"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 text-[13px] text-[#555555]">
                  {subtitle}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer le panneau"
              className="p-1.5 rounded-lg text-[#777777] hover:text-[#111111] hover:bg-[#F8F6F4] transition-colors"
            >
              <CloseIcon size={18} />
            </button>
          </div>

          {/* Corps défilant du panneau */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            {children}
          </div>

          {/* Pied de panneau avec actions optionnelles */}
          {footer && (
            <div className="px-6 py-4 border-t border-[#E8E4DF] bg-[#FAF8F6] flex items-center justify-end gap-3 shrink-0">
              {footer}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
