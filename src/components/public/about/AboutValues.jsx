// PROVISIONAL CONTENT - TO BE VALIDATED BY CLIENT
import { useEffect, useRef, useState } from 'react'
import { ShieldCheck, Zap, RefreshCw, MapPin } from 'lucide-react'

const VALUES_CONTENT = {
  eyebrow: 'ADN FL STRUCTURES',
  title: 'Nos Valeurs Fondamentales',
  subtitle:
    'Les principes qui guident nos actions et garantissent la qualité, la sécurité et le professionnalisme de nos interventions sur les sites miniers.',
  items: [
    {
      num: '01',
      title: 'FIABILITÉ',
      description:
        'Respect strict des délais et de vos exigences opérationnelles les plus pointues.',
      icon: ShieldCheck,
    },
    {
      num: '02',
      title: 'RÉACTIVITÉ',
      description:
        'Capacité de mobilisation immédiate face aux imprévus du terrain.',
      icon: Zap,
    },
    {
      num: '03',
      title: 'FLEXIBILITÉ',
      description:
        'Adaptation continue aux contraintes logistiques complexes des bases-vie.',
      icon: RefreshCw,
    },
    {
      num: '04',
      title: 'PROXIMITÉ',
      description:
        'Ancrage local fort et présence constante de nos équipes à vos côtés.',
      icon: MapPin,
    },
  ],
}

// Wavy path passing through the 4 milestones (x = 150 / 450 / 750 / 1050),
// with horizontal tangents at each milestone for a smooth flow.
const WAVE_PATH =
  'M0 105 C60 140 90 140 150 140 S390 70 450 70 S690 140 750 140 S990 70 1050 70 S1140 105 1200 105'

const DRAW_DURATION = 2.6 // seconds
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)'

// Milestone x position (fraction of the width) -> delay synced with the line drawing
const nodeDelay = (index) => (0.125 + index * 0.25) * DRAW_DURATION * 0.92

function useInViewOnce(reduced) {
  const ref = useRef(null)
  const [inView, setInView] = useState(reduced)

  useEffect(() => {
    if (reduced) return undefined
    const el = ref.current
    if (!el) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced])

  return [ref, inView]
}

export default function AboutValues() {
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [ref, inView] = useInViewOnce(reduced)

  const t = (props, duration, delay = 0) =>
    reduced ? 'none' : `${props} ${duration}s ${EASE} ${delay}s`

  return (
    <section className="bg-brand-cream py-16 md:py-24 border-b border-gray-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 lg:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200/80 bg-white font-heading text-[0.625rem] font-bold uppercase tracking-[0.18em] text-brand-black shadow-xs mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0" aria-hidden="true" />
            <span>{VALUES_CONTENT.eyebrow}</span>
          </div>
          <h2 className="font-heading font-extrabold uppercase text-[1.375rem] sm:text-[1.625rem] lg:text-[1.75rem] text-brand-black tracking-[0.03em] leading-tight">
            {VALUES_CONTENT.title}
          </h2>
          <div className="h-0.5 w-12 bg-brand-red rounded-full mt-3.5" aria-hidden="true" />
          <p className="text-gray-500 text-[0.8125rem] sm:text-[0.84375rem] mt-3 max-w-xl leading-[1.65]">
            {VALUES_CONTENT.subtitle}
          </p>
        </div>

        <div ref={ref}>
          {/* ───────── Desktop: wavy timeline ───────── */}
          <div className="hidden lg:block relative group/timeline">
            {/* SVG wave (behind the milestones) */}
            <svg
              viewBox="0 0 1200 210"
              preserveAspectRatio="none"
              className="absolute inset-x-0 top-0 h-[210px] w-full overflow-visible pointer-events-none"
              aria-hidden="true"
            >
              {/* Faint dashed track, always visible */}
              <path
                d={WAVE_PATH}
                fill="none"
                className="stroke-gray-300"
                strokeWidth="1.5"
                strokeDasharray="3 7"
                strokeLinecap="round"
              />
              {/* Soft glow */}
              <path
                id="values-wave-glow"
                d={WAVE_PATH}
                pathLength="1"
                fill="none"
                className="stroke-brand-red"
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.12"
                style={{
                  strokeDasharray: 1,
                  strokeDashoffset: inView ? 0 : 1,
                  transition: t('stroke-dashoffset', DRAW_DURATION),
                }}
              />
              {/* Main line that draws itself and connects the 4 milestones */}
              <path
                id="values-wave"
                d={WAVE_PATH}
                pathLength="1"
                fill="none"
                className="stroke-brand-red"
                strokeWidth="2"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 1,
                  strokeDashoffset: inView ? 0 : 1,
                  transition: t('stroke-dashoffset', DRAW_DURATION),
                }}
              />
              {/* Red dot travelling along the line on hover */}
              {!reduced && (
                <circle
                  r="5"
                  className="fill-brand-red opacity-0 group-hover/timeline:opacity-100 transition-opacity duration-300"
                >
                  <animateMotion dur="5s" repeatCount="indefinite" rotate="auto">
                    <mpath href="#values-wave" />
                  </animateMotion>
                </circle>
              )}
            </svg>

            {/* 4 milestones + texts */}
            <div className="relative grid grid-cols-4">
              {VALUES_CONTENT.items.map((item, i) => {
                const Icon = item.icon
                const low = i % 2 === 0
                const topPct = low ? '66.667%' : '33.333%'
                const delay = nodeDelay(i)
                return (
                  <div key={item.num} className="group/node relative flex flex-col items-center text-center px-4">
                    {/* Milestone zone, same height as the SVG */}
                    <div className="relative h-[210px] w-full">
                      {/* Dashed connector from the milestone down to the text */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 border-l border-dashed border-gray-300 origin-top"
                        style={{
                          top: topPct,
                          bottom: 0,
                          transform: `translateX(-50%) scaleY(${inView ? 1 : 0})`,
                          transition: t('transform', 0.7, delay + 0.2),
                        }}
                        aria-hidden="true"
                      />
                      {/* Milestone */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{ top: topPct }}
                      >
                        <div
                          style={{
                            opacity: inView ? 1 : 0,
                            transform: `scale(${inView ? 1 : 0.4})`,
                            transition: t('opacity, transform', 0.6, delay),
                          }}
                        >
                          <span
                            className="absolute inset-0 rounded-full bg-brand-red/25 motion-safe:animate-ping"
                            style={{ animationDuration: '2.8s', animationDelay: `${delay}s` }}
                            aria-hidden="true"
                          />
                          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-brand-red text-brand-red shadow-lg shadow-black/10 transition-all duration-300 group-hover/node:bg-brand-red group-hover/node:text-white group-hover/node:scale-110 group-hover/node:shadow-brand-red/30">
                            <Icon size={18} strokeWidth={2} aria-hidden="true" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Text */}
                    <div
                      className="mt-4 flex flex-col items-center"
                      style={{
                        opacity: inView ? 1 : 0,
                        transform: `translateY(${inView ? 0 : 12}px)`,
                        transition: t('opacity, transform', 0.7, delay + 0.25),
                      }}
                    >
                      <span className="font-heading text-[0.625rem] font-bold tracking-[0.2em] text-brand-red mb-1.5">
                        N° {item.num}
                      </span>
                      <h3 className="font-heading font-bold text-[0.875rem] uppercase tracking-[0.1em] text-brand-black mb-2 transition-colors duration-200 group-hover/node:text-brand-red">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-[0.8125rem] leading-[1.65] max-w-[15rem]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ───────── Mobile / tablet: vertical timeline ───────── */}
          <div className="lg:hidden relative max-w-xl mx-auto pl-14">
            <div
              className="absolute left-[22px] top-2 bottom-2 w-0.5 bg-brand-red/80 rounded-full origin-top"
              style={{
                transform: `scaleY(${inView ? 1 : 0})`,
                transition: t('transform', DRAW_DURATION),
              }}
              aria-hidden="true"
            />
            <div className="absolute left-[22px] top-2 bottom-2 w-px border-l border-dashed border-gray-300" aria-hidden="true" />

            <ol className="flex flex-col gap-9">
              {VALUES_CONTENT.items.map((item, i) => {
                const Icon = item.icon
                const delay = (i / 4) * DRAW_DURATION * 0.9
                return (
                  <li
                    key={item.num}
                    className="relative"
                    style={{
                      opacity: inView ? 1 : 0,
                      transform: `translateY(${inView ? 0 : 12}px)`,
                      transition: t('opacity, transform', 0.7, delay),
                    }}
                  >
                    <div className="absolute -left-14 top-0 flex h-11 w-11 items-center justify-center rounded-full bg-white border-2 border-brand-red text-brand-red shadow-md shadow-black/10">
                      <Icon size={17} strokeWidth={2} aria-hidden="true" />
                    </div>
                    <span className="font-heading text-[0.625rem] font-bold tracking-[0.2em] text-brand-red">
                      N° {item.num}
                    </span>
                    <h3 className="font-heading font-bold text-[0.875rem] uppercase tracking-[0.1em] text-brand-black mt-1 mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-[0.8125rem] leading-[1.65]">
                      {item.description}
                    </p>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
