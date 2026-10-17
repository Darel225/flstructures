/**
 * Micro-sélecteur d'onglets de langue pour les champs bilingues (FR / EN).
 * Style conforme aux règles : soulignement rouge fin, sans pilule colorée, sans emoji.
 */
export default function BilingualTabs({
  activeTab,
  activeLang,
  onChange,
  className = '',
}) {
  const currentTab = activeTab || activeLang || 'fr'

  return (
    <div
      role="tablist"
      aria-label="Sélection de la langue d'édition"
      className={`inline-flex items-center gap-4 border-b border-[#E8E4DF] select-none ${className}`}
    >
      {/* Onglet Français */}
      <button
        type="button"
        role="tab"
        id="tab-fr"
        aria-selected={currentTab === 'fr'}
        aria-controls="panel-fr"
        onClick={() => onChange('fr')}
        className={`inline-flex items-center gap-1.5 pb-2 text-[13px] transition-all relative ${
          currentTab === 'fr'
            ? 'font-semibold text-[#C0392B] border-b-2 border-[#C0392B] -mb-[1px]'
            : 'font-medium text-[#777777] hover:text-[#111111] border-b-2 border-transparent'
        }`}
      >
        <span>Français (FR)</span>
      </button>

      {/* Onglet Anglais */}
      <button
        type="button"
        role="tab"
        id="tab-en"
        aria-selected={currentTab === 'en'}
        aria-controls="panel-en"
        onClick={() => onChange('en')}
        className={`inline-flex items-center gap-1.5 pb-2 text-[13px] transition-all relative ${
          currentTab === 'en'
            ? 'font-semibold text-[#C0392B] border-b-2 border-[#C0392B] -mb-[1px]'
            : 'font-medium text-[#777777] hover:text-[#111111] border-b-2 border-transparent'
        }`}
      >
        <span>English (EN)</span>
      </button>
    </div>
  )
}
