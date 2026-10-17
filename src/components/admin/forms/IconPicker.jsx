import { useState, useMemo } from 'react'
import { SearchIcon, CheckIcon } from '../icons/AdminIcons'
import { AVAILABLE_ICONS } from './iconList'
import DynamicIcon from './DynamicIcon'

/**
 * Sélecteur visuel interactif d'icônes Lucide.
 * Permet de rechercher et sélectionner instantanément une icône pour l'équipement avec aperçu dynamique.
 */
export default function IconPicker({
  value = 'Wifi',
  onChange,
  label = 'Icône représentative',
  error,
  hint,
}) {
  const [search, setSearch] = useState('')

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return AVAILABLE_ICONS
    const q = search.toLowerCase().trim()
    return AVAILABLE_ICONS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
    )
  }, [search])

  const selectedItem =
    AVAILABLE_ICONS.find((i) => i.name === value) || {
      name: value || 'Wifi',
      label: value || 'Wifi',
    }

  return (
    <div className="space-y-2.5">
      {/* Libellé */}
      {label && (
        <label className="block text-[12.5px] font-semibold text-[#111111]">
          {label}
        </label>
      )}

      {/* Carte aperçu de l'icône active */}
      <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-[#E8E4DF] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#FAF8F6] text-[#C0392B] border border-[#E8E4DF] shrink-0">
          <DynamicIcon name={value} size={22} className="text-[#C0392B]" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="font-semibold text-[13px] text-[#111111] block truncate">
            {selectedItem.label}
          </span>
          <span className="font-mono text-[11px] text-[#777777]">
            Identifiant : &quot;{value}&quot;
          </span>
        </div>
      </div>

      {/* Barre de recherche dans les icônes */}
      <div className="relative">
        <SearchIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777777] pointer-events-none" />
        <input
          type="text"
          placeholder="Filtrer une icône (clim, wifi, zap, lit, douche, restaurant...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-3 text-[13px] bg-white border border-[#E8E4DF] rounded-xl text-[#111111] placeholder-[#999999] focus:outline-none focus:border-[#C0392B] focus:ring-1 focus:ring-[#C0392B] transition-all"
        />
      </div>

      {/* Grille de sélection d'icônes */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-52 overflow-y-auto p-2 border border-[#E8E4DF] rounded-2xl bg-white">
        {filteredIcons.length === 0 ? (
          <div className="col-span-full py-6 text-center text-xs text-[#888888]">
            Aucune icône trouvée pour &quot;{search}&quot;.
          </div>
        ) : (
          filteredIcons.map((item) => {
            const isSelected = item.name === value

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => onChange(item.name)}
                title={`${item.label} (${item.name})`}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#C0392B]/10 text-[#C0392B] border border-[#C0392B]/30 font-semibold shadow-xs'
                    : 'text-[#555555] hover:text-[#111111] hover:bg-[#FAF8F6] border border-transparent'
                }`}
              >
                <DynamicIcon name={item.name} size={18} />
                <span className="text-[10px] truncate max-w-full mt-1.5 leading-none">
                  {item.label.split('/')[0].trim()}
                </span>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#C0392B] text-white flex items-center justify-center shadow-xs">
                    <CheckIcon size={9} strokeWidth={2.5} />
                  </div>
                )}
              </button>
            )
          })
        )}
      </div>

      {/* Message d'erreur ou d'aide */}
      {error ? (
        <p className="text-[12px] text-[#C0392B] font-medium">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-[#777777]">{hint}</p>
      ) : null}
    </div>
  )
}
