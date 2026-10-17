// PROVISIONAL CONTENT - TO BE VALIDATED BY CLIENT
import { Check, Target, Compass } from 'lucide-react'
import useReveal from '../../../hooks/useReveal'
import missionImg from '../../../assets/images/about-mission.jpg'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

const MISSION_CONTENT = {
  eyebrow: "NOTRE RAISON D'ÊTRE",
  title: "Sécuriser l'approvisionnement des zones les plus exigeantes.",
  blocks: {
    mission: {
      tag: 'ENGAGEMENT OPÉRATIONNEL',
      label: 'Notre Mission :',
      text: "Sécuriser la continuité de vos opérations minières grâce à une chaîne d'approvisionnement alimentaire fiable. Nous déployons une organisation rigoureuse couplée à une forte proximité terrain.",
    },
    vision: {
      tag: 'AMBITION STRATÉGIQUE',
      label: 'Notre Vision :',
      text: "S'imposer comme le partenaire logistique B2B de référence, en alliant des standards de sécurité exigeants à une maîtrise parfaite de l'environnement local.",
    },
  },
  checklist: [
    'Traçabilité et chaîne du froid maîtrisées',
    'Interventions en bases-vie isolées',
  ],
  chip: 'ÉQUIPES TERRAIN & LOGISTIQUE',
}

export default function AboutMission() {
  const { ref, shown, prefersReduced } = useReveal({
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px',
  })

  const fadeUp = (delay, distance = 24) =>
    prefersReduced
      ? undefined
      : {
          opacity: shown ? 1 : 0,
          transform: shown ? 'translateY(0)' : `translateY(${distance}px)`,
          transition: `opacity 0.9s ${EASE} ${delay}ms, transform 1s ${EASE} ${delay}ms`,
        }

  return (
    <section ref={ref} className="bg-white py-16 md:py-24 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
          {/* Left Column: Briefing & Content */}
          <div className="flex flex-col justify-center">
            {/* Pill Eyebrow */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200/90 bg-brand-cream/70 font-heading text-[0.625rem] font-bold uppercase tracking-[0.18em] text-brand-red mb-4 w-fit shadow-xs"
              style={fadeUp(100)}
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0"
                aria-hidden="true"
              />
              <span>{MISSION_CONTENT.eyebrow}</span>
            </div>

            {/* Section Title */}
            <h2
              className="font-heading font-extrabold text-[1.5rem] sm:text-[1.75rem] lg:text-[1.875rem] text-brand-black text-balance leading-[1.2] tracking-tight mb-6"
              style={fadeUp(200)}
            >
              {MISSION_CONTENT.title}
            </h2>

            {/* Stacked Mission & Vision Briefing Cards */}
            <div className="flex flex-col gap-3.5">
              {/* Mission Block */}
              <div
                className="bg-linear-to-r from-gray-50/95 to-white border-l-[3px] border-brand-red border-y border-r border-gray-200/90 rounded-r-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300"
                style={fadeUp(320, 28)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading font-bold text-[0.6rem] tracking-[0.18em] text-brand-red uppercase">
                    {MISSION_CONTENT.blocks.mission.tag}
                  </span>
                  <Target size={15} className="text-brand-red shrink-0" aria-hidden="true" />
                </div>
                <p className="text-gray-600 text-[0.8125rem] sm:text-[0.84375rem] leading-[1.65]">
                  <strong className="font-heading font-bold text-brand-black">
                    {MISSION_CONTENT.blocks.mission.label}
                  </strong>{' '}
                  {MISSION_CONTENT.blocks.mission.text}
                </p>
              </div>

              {/* Vision Block */}
              <div
                className="bg-linear-to-r from-gray-50/95 to-white border-l-[3px] border-brand-black border-y border-r border-gray-200/90 rounded-r-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300"
                style={fadeUp(440, 28)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading font-bold text-[0.6rem] tracking-[0.18em] text-gray-500 uppercase">
                    {MISSION_CONTENT.blocks.vision.tag}
                  </span>
                  <Compass size={15} className="text-gray-400 shrink-0" aria-hidden="true" />
                </div>
                <p className="text-gray-600 text-[0.8125rem] sm:text-[0.84375rem] leading-[1.65]">
                  <strong className="font-heading font-bold text-brand-black">
                    {MISSION_CONTENT.blocks.vision.label}
                  </strong>{' '}
                  {MISSION_CONTENT.blocks.vision.text}
                </p>
              </div>
            </div>

            {/* Refined checklist container */}
            <div
              className="mt-6 rounded-xl bg-brand-cream/60 border border-gray-200/80 px-5 py-4 shadow-xs"
              style={fadeUp(560, 20)}
            >
              <ul className="flex flex-col sm:flex-row gap-3 sm:gap-8">
                {MISSION_CONTENT.checklist.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2.5 text-[0.78125rem] text-gray-800 font-semibold font-heading leading-snug"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-green/15 text-brand-green border border-brand-green/30 shrink-0">
                      <Check size={12} strokeWidth={2.5} aria-hidden="true" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: image stretches to the full height of the text column with reveal */}
          <figure
            className="relative group min-h-[320px] lg:min-h-0"
            style={fadeUp(250, 36)}
          >
            <div className="absolute inset-0 overflow-hidden rounded-2xl shadow-2xl border border-gray-200/90 bg-brand-black">
              <img
                src={missionImg}
                alt="Convoi logistique et opérations de transport en zone minière"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-[center_45%] transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03]"
                style={
                  prefersReduced
                    ? undefined
                    : {
                        transform: shown ? 'scale(1)' : 'scale(1.06)',
                        transition: `transform 1.8s ${EASE} 250ms`,
                      }
                }
              />

              {/* Subtle gradient for chip legibility */}
              <div
                className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-black/10 pointer-events-none"
                aria-hidden="true"
              />

              {/* Top-Right Mining Tag */}
              <div
                className="absolute top-4 right-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/25 text-white font-heading text-[0.6rem] font-bold uppercase tracking-[0.18em] shadow-md"
                style={
                  prefersReduced
                    ? undefined
                    : {
                        opacity: shown ? 1 : 0,
                        transform: shown ? 'translateY(0)' : 'translateY(-12px)',
                        transition: `opacity 0.8s ${EASE} 500ms, transform 0.8s ${EASE} 500ms`,
                      }
                }
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0" aria-hidden="true" />
                <span>SECTEUR MINIER · CI</span>
              </div>

              {/* Status Chip bottom-left on the image */}
              <div
                className="absolute bottom-4 left-4 inline-flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/25 text-white text-[0.65rem] font-heading font-bold uppercase tracking-wider shadow-2xl"
                style={
                  prefersReduced
                    ? undefined
                    : {
                        opacity: shown ? 1 : 0,
                        transform: shown ? 'translateY(0)' : 'translateY(16px)',
                        transition: `opacity 0.8s ${EASE} 650ms, transform 0.8s ${EASE} 650ms`,
                      }
                }
              >
                <span
                  className="h-2 w-2 rounded-full bg-brand-green shrink-0 animate-pulse shadow-xs shadow-brand-green/80"
                  aria-hidden="true"
                />
                <div className="flex flex-col">
                  <span>{MISSION_CONTENT.chip}</span>
                  <span className="text-[0.6rem] font-normal lowercase tracking-normal text-white/70">
                    déploiement continu sur site
                  </span>
                </div>
              </div>
            </div>
          </figure>
        </div>
      </div>
    </section>
  )
}
