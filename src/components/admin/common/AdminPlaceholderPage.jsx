import { ProjetsIcon } from '../icons/AdminIcons'

/**
 * Page de substitution temporaire pour les sous-sections de l'espace d'administration
 * en attente des étapes suivantes de développement.
 * @param {{ title: string, description?: string }} props
 */

export default function AdminPlaceholderPage({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-white rounded-2xl border border-[#E8E4DF] shadow-2xs">
      <div className="w-12 h-12 rounded-xl bg-[#F8F6F4] text-[#111111] border border-[#E8E4DF] flex items-center justify-center mb-4">
        <ProjetsIcon size={24} />
      </div>

      <h1 className="fl-admin-title-page text-[#111111]">
        {title}
      </h1>

      <p className="mt-2 text-xs text-[#777777] max-w-md">
        {description ||
          "Ce module d'administration sera raccordé et opérationnel lors des prochaines étapes de la mission."}
      </p>

      <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8F6F4] text-xs font-semibold text-[#111111] border border-[#E8E4DF]">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span>En cours de développement</span>
      </div>
    </div>
  )
}
