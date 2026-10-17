import { ShieldCheck, ArrowRight, FileCheck, CheckCircle2, Wrench, Truck, Cpu, HardHat } from 'lucide-react'
import { usePartenaireModal } from '../../store/partenaireModalStore'

export default function Partenaire() {
  const { openPartenaireModal } = usePartenaireModal()

  const domaines = [
    {
      icon: <Truck className="text-[#C0392B]" size={24} />,
      title: 'Transport Spécial & Fret Lourd',
      desc: 'Porte-chars, plateaux surbaissés, transport sécurisé vers les mines reculées.',
    },
    {
      icon: <HardHat className="text-[#C0392B]" size={24} />,
      title: 'Levage, Manutention & Grues',
      desc: 'Grues tout-terrain 50T-120T, chariots télescopiques, équipes de grutage certifiées.',
    },
    {
      icon: <Wrench className="text-[#C0392B]" size={24} />,
      title: 'Génie Civil & Plateformes',
      desc: 'Coulage de radiers, plots béton, nivellement et terrassement préliminaire.',
    },
    {
      icon: <Cpu className="text-[#C0392B]" size={24} />,
      title: 'Énergies & Froid Industriel',
      desc: 'Centrales solaires hybrides, groupes électrogènes, climatisation industrielle.',
    },
  ]

  const piecesRequises = [
    'Registre de Commerce (RCCM / Kbis à jour)',
    'Déclaration Fiscale d’Existence (DFE) & Attestation de Régularité Fiscale',
    'Attestation d’Assurance Responsabilité Civile Professionnelle',
    'Plaquette de présentation des équipements & habilitations HSE',
    'Bordereau des principales références de chantiers industriels/miniers',
  ]

  return (
    <div className="bg-white min-h-[80vh]">
      {/* React 19 Document Metadata */}
      <title>Devenir Partenaire & Fournisseur Agréé | FL STRUCTURES</title>
      <meta
        name="description"
        content="Rejoignez le panel de sous-traitants et partenaires agréés de FL STRUCTURES pour nos opérations de bases-vie et constructions modulaires minières en Côte d'Ivoire."
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#111111] via-[#1A1A1A] to-[#222222] text-white py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs border border-white/10 mb-6">
              <ShieldCheck size={14} className="text-[#C0392B]" />
              <span>Portail Achats & Grands Comptes</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Devenez Fournisseur & Partenaire Stratégique
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-300 leading-relaxed font-light">
              Dans le cadre du déploiement de nos bases-vie modulaires et hangars industriels sur les grands sites miniers de Côte d&apos;Ivoire, FL STRUCTURES sélectionne des prestataires et sous-traitants d&apos;excellence.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => openPartenaireModal()}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:shadow-[#C0392B]/25 transition-all cursor-pointer"
              >
                <span>Déposer mon dossier d&apos;agrément</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Domaines d'expertise recherchés */}
      <section className="py-16 md:py-20 bg-[#FAF8F6] border-b border-[#E8E4DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C0392B]">
              Compétences Clés
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111111] mt-1">
              Domaines d&apos;Expertise & Prestations Recherchées
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {domaines.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-[#E8E4DF] shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-[#111111] mb-2">{item.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dossier d'agrément & checklist */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#E8E4DF] rounded-3xl p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C0392B]">
                Constitution du Dossier
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111111] mt-1 mb-4">
                Pièces Justificatives pour l&apos;Agrément Fournisseur
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
                Afin de garantir le respect des normes HSE et de conformité exigées par les compagnies minières internationales, votre dossier de candidature doit idéalement regrouper :
              </p>
              <ul className="space-y-3">
                {piecesRequises.map((piece, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#333333]">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{piece}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5 bg-[#FAF8F6] p-8 rounded-3xl border border-[#E8E4DF] text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#C0392B] flex items-center justify-center mb-4">
                <FileCheck size={32} />
              </div>
              <h3 className="text-lg font-bold text-[#111111]">Prêt à postuler ?</h3>
              <p className="text-xs text-gray-600 mt-2 mb-6">
                Remplissez notre formulaire en ligne et joignez directement votre document d&apos;agrément en PDF ou Word (jusqu&apos;à 25 Mo).
              </p>
              <button
                type="button"
                onClick={() => openPartenaireModal()}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
              >
                <span>Ouvrir le formulaire</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
