// CONTENU PROVISOIRE À VALIDER
import { useEffect, useRef, useState } from 'react'
import SectionIntro from '../../common/SectionIntro'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

const METHOD_STEPS = [
  {
    number: '01',
    title: 'PLANIFIER',
    description:
      "Analyse des besoins et dimensionnement de l'approvisionnement.",
    tag: 'PHASE PRÉLIMINAIRE',
    isSpecial: false,
  },
  {
    number: '02',
    title: 'SOURCER',
    description:
      'Sélection stricte selon votre mercuriale et vos exigences.',
    tag: 'RÉSEAU DE FOURNISSEURS',
    isSpecial: false,
  },
  {
    number: '03',
    title: 'CONTRÔLER',
    description:
      'Vérification rigoureuse de la qualité et de la conformité.',
    tag: 'NORMES SANITAIRES',
    isSpecial: true,
  },
  {
    number: '04',
    title: 'ORGANISER',
    description:
      'Préparation des commandes et planification logistique.',
    tag: 'ROTATIONS & DÉLAIS',
    isSpecial: false,
  },
  {
    number: '05',
    title: 'LIVRER',
    description:
      'Acheminement sécurisé et maintien de la chaîne du froid sur site minier.',
    tag: 'SITES ÉLOIGNÉS & MINES',
    isSpecial: false,
  },
  {
    number: '06',
    title: 'MESURER',
    description:
      'Suivi des indicateurs de performance et traçabilité.',
    tag: "KPI & RETOUR D'EXPÉRIENCE",
    isSpecial: false,
  },
]

const STAGGER_MS = 230

export default function MethodSection({
  overline = 'EXCELLENCE OPÉRATIONNELLE',
  title = 'NOTRE MÉTHODE',
  subtitle = 'Une approche rigoureuse en 6 étapes pour garantir la continuité de vos opérations.',
} = {}) {
  const cardRefs = useRef([])
  const [prefersReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  // delays[i] = délai d'apparition de la carte i (undefined = pas encore visible)
  const [delays, setDelays] = useState({})

  useEffect(() => {
    if (prefersReduced) return
    const observer = new IntersectionObserver(
      (entries) => {
        // Cartes entrant ensemble dans l'écran : apparition une par une, dans l'ordre
        const incoming = entries
          .filter((e) => e.isIntersecting)
          .map((e) => Number(e.target.dataset.index))
          .sort((a, b) => a - b)
        if (!incoming.length) return
        setDelays((prev) => {
          const next = { ...prev }
          incoming.forEach((idx, order) => {
            next[idx] = order * STAGGER_MS
          })
          return next
        })
        entries.forEach((e) => e.isIntersecting && observer.unobserve(e.target))
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    )
    cardRefs.current.forEach((n) => n && observer.observe(n))
    return () => observer.disconnect()
  }, [prefersReduced])

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionIntro
          overline={overline}
          title={title}
          subtitle={subtitle}
          align="center"
          withBar={true}
          titleClassName="font-heading font-extrabold text-[1.25rem] sm:text-[1.4rem] md:text-[1.55rem] text-brand-black leading-snug tracking-tight"
          subtitleClassName="text-[0.875rem] sm:text-[0.9375rem] md:text-[1rem] text-gray-600 leading-relaxed mt-3.5 max-w-2xl font-normal"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 mt-12 md:mt-14">
          {METHOD_STEPS.map((step, i) => {
            const accent = step.isSpecial ? 'bg-brand-green' : 'bg-brand-red'
            const delay = delays[i]
            const shown = prefersReduced || delay !== undefined
            const d = delay ?? 0

            return (
              <div
                key={step.number}
                ref={(n) => (cardRefs.current[i] = n)}
                data-index={i}
                style={
                  prefersReduced
                    ? undefined
                    : {
                        opacity: shown ? 1 : 0,
                        transform: shown
                          ? 'translateY(0)'
                          : 'translateY(56px)',
                        filter: shown ? 'blur(0)' : 'blur(4px)',
                        transition: `opacity 1.1s ${EASE} ${d}ms, transform 1.2s ${EASE} ${d}ms, filter 1s ${EASE} ${d}ms`,
                      }
                }
              >
                <div className="group relative h-full bg-brand-cream/70 hover:bg-white border border-gray-200/80 hover:border-gray-300 rounded-xl p-6 md:p-7 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-[0_24px_48px_-20px_rgba(17,17,17,0.2)] transition-all duration-500 motion-safe:hover:-translate-y-1.5">
                  {/* Grand numéro en filigrane ciselé */}
                  <span
                    aria-hidden="true"
                    className="absolute top-4 right-5 font-heading font-black text-3xl sm:text-4xl text-gray-200/90 tracking-tight leading-none select-none pointer-events-none transition-all duration-700 group-hover:text-gray-300/80 group-hover:-translate-y-1"
                    style={
                      prefersReduced
                        ? undefined
                        : {
                            opacity: shown ? 1 : 0,
                            transitionProperty: 'opacity, transform, color',
                            transitionDelay: shown ? `${d + 300}ms, 0ms, 0ms` : '0ms',
                          }
                    }
                  >
                    {step.number}
                  </span>

                  <div className="relative z-10">
                    {/* Trait : se trace à l'apparition puis s'allonge au survol */}
                    <div
                      className={`h-0.5 rounded-full mb-4.5 origin-left w-7 group-hover:w-12 transition-[width] duration-500 ${accent}`}
                    >
                      <div
                        className={`h-full w-full rounded-full origin-left ${accent}`}
                        style={
                          prefersReduced
                            ? undefined
                            : {
                                transform: shown ? 'scaleX(1)' : 'scaleX(0)',
                                transition: `transform 0.9s ${EASE} ${d + 400}ms`,
                              }
                        }
                      />
                    </div>

                    <h3 className="font-heading font-bold text-[1.125rem] sm:text-[1.25rem] text-brand-black uppercase tracking-wide mb-2.5 leading-snug">
                      {step.title}
                    </h3>

                    <p className="text-[0.8125rem] sm:text-[0.84375rem] text-gray-600 leading-[1.65] font-normal mb-6">
                      {step.description}
                    </p>
                  </div>

                  {/* Filet et libellé de bas de carte */}
                  <div className="border-t border-gray-200/80 pt-4 mt-auto relative z-10">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${accent}`}
                      />
                      <span
                        className={`font-heading text-[0.6rem] font-bold uppercase tracking-[0.18em] transition-colors duration-300 ${
                          step.isSpecial
                            ? 'text-brand-green'
                            : 'text-gray-500 group-hover:text-gray-700'
                        }`}
                      >
                        {step.tag}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

