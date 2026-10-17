import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Download, FileText, Lock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { usePartenaireModal } from '../../../store/partenaireModalStore'
import { getSettings, getMercurialeUrl } from '../../../services/api/settings.service'

const PARTNERS_CONTENT = {
  eyebrow: 'Portail achats & fournisseurs',
  title: 'Espace partenaires & grands comptes',
  description:
    'Rejoignez notre réseau de fournisseurs ou soumettez directement vos cahiers des charges. Un espace dédié pour faciliter le téléchargement de vos documents institutionnels et le dépôt de vos demandes de cotation.',
  buttons: {
    buyer: {
      label: 'Formulaire acheteurs & grands comptes',
      to: '/devenir-partenaire',
    },
    provider: {
      label: 'Demander notre dossier fournisseur / Mercuriale',
      to: '/devenir-partenaire',
    },
  },
  note: 'Le formulaire permet le dépôt sécurisé de vos pièces jointes, mercuriales et cahiers des charges.',
}

export default function AboutPartners() {
  const cardRef = useRef(null)
  const [prefersReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const [isRevealed, setIsRevealed] = useState(prefersReduced)
  const { openPartenaireModal } = usePartenaireModal()

  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: getSettings,
    staleTime: 5 * 60 * 1000,
  })

  const mercurialeUrl = settings?.fichier_mercuriale_globale
    ? getMercurialeUrl(settings.fichier_mercuriale_globale)
    : null

  useEffect(() => {
    if (prefersReduced) return

    const node = cardRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true)
          observer.unobserve(node)
        }
      },
      { threshold: 0.28 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [prefersReduced])

  const easeCurve = 'cubic-bezier(0.22, 1, 0.36, 1)'

  const fadeClass = (delayClass) =>
    prefersReduced
      ? 'opacity-100 translate-y-0'
      : `transition-all duration-700 ${easeCurve} ${delayClass} ${
          isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`

  return (
    <section className="bg-white py-16 md:py-24 border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grande carte en 2 colonnes (55% / 45%) sans liseré, sans halo ni texture */}
        <div
          ref={cardRef}
          className={`relative rounded-3xl lg:rounded-[2rem] bg-white border border-gray-200/70 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-7 sm:p-10 md:p-12 lg:p-14 overflow-hidden ${
            prefersReduced
              ? 'opacity-100 translate-y-0'
              : `transition-all duration-800 ${easeCurve} ${
                  isRevealed
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-3'
                }`
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Colonne gauche (~55%) : Alignée à gauche */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Pastille : même échelle typographique que le tag ENGAGEMENT OPÉRATIONNEL */}
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200/90 bg-white font-heading text-[0.6rem] font-bold uppercase tracking-[0.18em] text-brand-red mb-3.5 shadow-xs ${fadeClass(
                  'delay-100'
                )}`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0"
                  aria-hidden="true"
                />
                <span>{PARTNERS_CONTENT.eyebrow}</span>
              </div>

              {/* Titre fort avec taille et interligne équilibrés */}
              <h2
                className={`font-heading font-extrabold text-[1.375rem] sm:text-[1.5rem] lg:text-[1.75rem] text-brand-black leading-[1.2] tracking-tight text-balance ${fadeClass(
                  'delay-200'
                )}`}
              >
                {PARTNERS_CONTENT.title}
              </h2>

              {/* Petit filet rouge court qui se trace */}
              <div
                className="h-0.5 bg-brand-red mt-2.5 origin-left"
                style={{
                  width: '36px',
                  transform:
                    isRevealed || prefersReduced ? 'scaleX(1)' : 'scaleX(0)',
                  transition: prefersReduced
                    ? 'none'
                    : `transform 0.8s ${easeCurve} 300ms`,
                }}
                aria-hidden="true"
              />

              {/* Paragraphe descriptif : typographie identique à la section Mission */}
              <p
                className={`text-[0.8125rem] sm:text-[0.84375rem] text-gray-600 leading-[1.65] mt-3.5 font-normal max-w-[46ch] ${fadeClass(
                  'delay-350'
                )}`}
              >
                {PARTNERS_CONTENT.description}
              </p>
            </div>

            {/* Colonne droite (~45%) : Deux lignes d'action empilées + Note de sécurité */}
            <div className="lg:col-span-5 flex flex-col justify-center w-full">
              <div className="space-y-3.5 sm:space-y-4 w-full">
                {/* Ligne principale rouge (dominante) */}
                <div className={fadeClass('delay-500')}>
                  <button
                    type="button"
                    onClick={() => openPartenaireModal()}
                    className="group relative flex items-center justify-between w-full min-h-[64px] sm:min-h-[68px] px-5 sm:px-6 rounded-2xl bg-brand-red text-white transition-all duration-300 shadow-sm hover:bg-brand-red-dark hover:shadow-md hover:shadow-brand-red/25 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red select-none cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
                      <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-white">
                        <FileText
                          size={18}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      </div>
                      <span className="font-heading font-bold text-[0.75rem] sm:text-[0.78rem] tracking-[0.08em] uppercase text-white truncate">
                        {PARTNERS_CONTENT.buttons.buyer.label}
                      </span>
                    </div>

                    <ArrowRight
                      size={18}
                      className="text-white shrink-0 transition-transform duration-300 motion-safe:group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </button>
                </div>

                {/* Ligne secondaire blanche avec survol doux et transparent */}
                <div className={fadeClass('delay-650')}>
                  {mercurialeUrl ? (
                    <a
                      href={mercurialeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex items-center justify-between w-full min-h-[64px] sm:min-h-[68px] px-5 sm:px-6 rounded-2xl border border-gray-200/90 bg-white hover:bg-brand-cream/50 hover:border-gray-300/80 text-brand-black transition-all duration-300 shadow-xs hover:shadow-sm active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red select-none cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
                        <div className="h-10 w-10 rounded-xl bg-gray-100/90 flex items-center justify-center shrink-0 text-brand-black transition-colors duration-300 group-hover:bg-white group-hover:shadow-xs">
                          <Download
                            size={18}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        </div>
                        <span className="font-heading font-bold text-[0.75rem] sm:text-[0.78rem] tracking-[0.08em] uppercase text-brand-black truncate">
                          {PARTNERS_CONTENT.buttons.provider.label}
                        </span>
                      </div>

                      <ArrowRight
                        size={18}
                        className="text-brand-black/70 shrink-0 transition-[transform,color] duration-300 group-hover:text-brand-black motion-safe:group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openPartenaireModal()}
                      className="group relative flex items-center justify-between w-full min-h-[64px] sm:min-h-[68px] px-5 sm:px-6 rounded-2xl border border-gray-200/90 bg-white hover:bg-brand-cream/50 hover:border-gray-300/80 text-brand-black transition-all duration-300 shadow-xs hover:shadow-sm active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red select-none cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
                        <div className="h-10 w-10 rounded-xl bg-gray-100/90 flex items-center justify-center shrink-0 text-brand-black transition-colors duration-300 group-hover:bg-white group-hover:shadow-xs">
                          <Download
                            size={18}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        </div>
                        <span className="font-heading font-bold text-[0.75rem] sm:text-[0.78rem] tracking-[0.08em] uppercase text-brand-black truncate">
                          {PARTNERS_CONTENT.buttons.provider.label}
                        </span>
                      </div>

                      <ArrowRight
                        size={18}
                        className="text-brand-black/70 shrink-0 transition-[transform,color] duration-300 group-hover:text-brand-black motion-safe:group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Note de sécurité sobre avec filet très fin */}
              <div
                className={`border-t border-gray-100 pt-4 mt-5 flex items-start gap-2.5 ${fadeClass(
                  'delay-800'
                )}`}
              >
                <Lock
                  size={14}
                  className="text-brand-red shrink-0 mt-0.5"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <p className="text-[0.75rem] sm:text-[0.78125rem] text-gray-500 leading-relaxed font-normal">
                  {PARTNERS_CONTENT.note}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
