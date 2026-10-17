// PROVISIONAL CONTENT - TO BE VALIDATED BY CLIENT
import { useEffect, useRef, useState } from 'react'
import { Check, ClipboardCheck, Snowflake } from 'lucide-react'
import securityImg from '../../../assets/images/2.png'

const SECURITY_CONTENT = {
  tag: 'SÉCURITÉ ALIMENTAIRE',
  title: 'Sécurité Alimentaire Sans Compromis.',
  description:
    "Nous appliquons une démarche de sécurité alimentaire rigoureuse. De la sélection des fournisseurs jusqu'à la livraison finale sur site isolé, nous veillons à la traçabilité et au maintien de la chaîne du froid.",
  steps: [
    {
      num: '01',
      title: 'Traçabilité des lots',
      description:
        "Identification de chaque cargaison depuis les fournisseurs jusqu'aux cantines de base-vie.",
      // Horizontal pan of the photo for this step
      position: '18% 0%',
    },
    {
      num: '02',
      title: 'Maintien de la chaîne du froid',
      description:
        'Transport réfrigéré adapté aux denrées fraîches et surgelées, selon le cahier des charges du client.',
      position: '55% 0%',
    },
    {
      num: '03',
      title: "Contrôles et audits d'hygiène",
      description:
        'Vérification des produits, contrôle de température à la réception et suivi documentaire, selon les exigences du client.',
      position: '88% 0%',
    },
  ],
}

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

/** Reveal once when the section enters the viewport. */
function useRevealOnce(reduced) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(reduced)

  useEffect(() => {
    if (reduced) return undefined
    const el = ref.current
    if (!el) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced])

  return [ref, seen]
}

/** Floating card on the photo, one per step (crossfade). */
function StepOverlay({ index }) {
  if (index === 0) {
    return (
      <>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red">
          <ClipboardCheck size={19} strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="font-heading text-[0.75rem] font-extrabold uppercase tracking-[0.06em] text-brand-black leading-tight">
            Traçabilité documentaire
          </span>
          <span className="mt-1 flex items-center gap-1.5 text-[0.71875rem] text-gray-600">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" aria-hidden="true" />
            Contrôles systématiques au départ
          </span>
        </div>
      </>
    )
  }
  if (index === 1) {
    return (
      <>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red">
          <Snowflake size={19} strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="font-heading text-[0.5625rem] font-bold uppercase tracking-[0.16em] text-brand-red leading-none mb-1">
            Engagement qualité
          </span>
          <span className="font-heading text-[0.75rem] font-extrabold uppercase tracking-[0.06em] text-brand-black leading-tight">
            Chaîne du froid maîtrisée
          </span>
        </div>
      </>
    )
  }
  return (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-red font-heading text-[0.8125rem] font-extrabold text-white shadow-md shadow-brand-red/30">
        QC
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="font-heading text-[0.75rem] font-extrabold uppercase tracking-[0.06em] text-brand-black leading-tight">
          Contrôle qualité
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-[0.71875rem] text-gray-600">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" aria-hidden="true" />
          Température vérifiée à la réception
        </span>
      </div>
    </>
  )
}

export default function AboutSecurity() {
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [rootRef, seen] = useRevealOnce(reduced)
  const [active, setActive] = useState(0)
  const stepRefs = useRef([])

  // Scroll sync: the step crossing the middle band of the viewport becomes active
  useEffect(() => {
    const nodes = stepRefs.current.filter(Boolean)
    if (!nodes.length) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(Number(entry.target.dataset.index))
          }
        })
      },
      { rootMargin: '-42% 0px -42% 0px', threshold: 0 },
    )
    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [])

  const t = (props, duration, delay = 0) =>
    reduced ? 'none' : `${props} ${duration}s ${EASE} ${delay}s`

  const total = SECURITY_CONTENT.steps.length

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden bg-white py-16 md:py-24 border-b border-gray-100"
    >
      {/* Soft decor: dotted texture + faint colour glows */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,15,15,0.07)_1px,transparent_0)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-brand-green/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-brand-red/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
          {/* ───────── Left: copy + step journey ───────── */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200/90 bg-white font-heading text-[0.625rem] font-bold uppercase tracking-[0.18em] text-brand-black mb-4 w-fit shadow-xs">
              <span
                className="h-1.5 w-1.5 rounded-full bg-brand-green shrink-0 motion-safe:animate-pulse"
                aria-hidden="true"
              />
              <span>{SECURITY_CONTENT.tag}</span>
            </div>

            <h2 className="font-heading font-extrabold text-[1.5rem] sm:text-[1.75rem] lg:text-[1.875rem] text-brand-black text-balance leading-[1.2] tracking-tight">
              {SECURITY_CONTENT.title}
            </h2>
            <div className="h-0.5 w-12 bg-brand-red rounded-full mt-3.5 mb-4" aria-hidden="true" />

            <p className="text-gray-600 text-[0.8125rem] sm:text-[0.84375rem] leading-[1.7] max-w-xl">
              {SECURITY_CONTENT.description}
            </p>

            <ol className="mt-7 flex flex-col">
              {SECURITY_CONTENT.steps.map((step, i) => {
                const done = i < active
                const current = i === active
                const last = i === total - 1
                return (
                  <li
                    key={step.num}
                    ref={(el) => {
                      stepRefs.current[i] = el
                    }}
                    data-index={i}
                    className="relative pl-14 pb-3 last:pb-0"
                    style={{
                      opacity: seen ? 1 : 0,
                      transform: `translateY(${seen ? 0 : 14}px)`,
                      transition: t('opacity, transform', 0.7, 0.1 + i * 0.15),
                    }}
                  >
                    {/* Connector segment: fills in red once the step is passed */}
                    {!last && (
                      <span
                        className="absolute left-[17px] top-[3.25rem] -bottom-3 w-0.5 overflow-hidden rounded-full bg-gray-200"
                        aria-hidden="true"
                      >
                        <span
                          className="block h-full w-full origin-top bg-brand-red"
                          style={{
                            transform: `scaleY(${done ? 1 : 0})`,
                            transition: reduced ? 'none' : 'transform 0.7s ease-in-out',
                          }}
                        />
                      </span>
                    )}

                    {/* Pulse ring on the active step */}
                    {current && (
                      <span
                        className="absolute left-0 top-4 h-9 w-9 rounded-full bg-brand-red/25 motion-safe:animate-ping"
                        style={{ animationDuration: '2.4s' }}
                        aria-hidden="true"
                      />
                    )}

                    {/* Milestone */}
                    <span
                      className={`absolute left-0 top-4 flex h-9 w-9 items-center justify-center rounded-full border-2 font-heading text-[0.6875rem] font-bold transition-all duration-500 ${
                        done
                          ? 'border-brand-red bg-brand-red text-white'
                          : current
                            ? 'scale-110 border-brand-red bg-white text-brand-red shadow-md shadow-brand-red/20'
                            : 'border-gray-300 bg-white text-gray-400'
                      }`}
                    >
                      {done ? <Check size={15} strokeWidth={3} aria-hidden="true" /> : step.num}
                    </span>

                    <button
                      type="button"
                      aria-current={current ? 'step' : undefined}
                      onClick={() => setActive(i)}
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      className={`w-full rounded-xl border px-5 py-4 text-left transition-all duration-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red ${
                        current
                          ? 'border-gray-200 bg-brand-cream/70 shadow-md'
                          : 'border-transparent hover:bg-gray-50/80'
                      }`}
                    >
                      <h3
                        className={`font-heading text-[0.875rem] font-bold tracking-[0.02em] transition-colors duration-300 ${
                          current ? 'text-brand-black' : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`mt-1.5 text-[0.8125rem] leading-[1.65] transition-colors duration-300 ${
                          current ? 'text-gray-600' : 'text-gray-500'
                        }`}
                      >
                        {step.description}
                      </p>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* ───────── Right: photo, full height of the text column ───────── */}
          <figure
            className="relative min-h-[400px] lg:min-h-0"
            style={{
              opacity: seen ? 1 : 0,
              transform: `translateY(${seen ? 0 : 18}px)`,
              transition: t('opacity, transform', 0.9, 0.2),
            }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-2xl border border-gray-200/90 bg-brand-black shadow-2xl">
              {/* Scaled from the top so the photo's bottom band is cropped out */}
              <img
                src={securityImg}
                alt="Rayons de produits alimentaires conditionnés, illustrant le contrôle qualité et la traçabilité"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full origin-top scale-[1.14] object-cover"
                style={{
                  objectPosition: SECURITY_CONTENT.steps[active].position,
                  transition: reduced ? 'none' : 'object-position 1.1s cubic-bezier(0.65, 0, 0.35, 1)',
                }}
              />

              <div
                className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-black/20"
                aria-hidden="true"
              />

              {/* Step counter */}
              <div className="absolute left-4 top-4 flex items-center gap-2.5 rounded-full border border-white/25 bg-black/55 px-3 py-1.5 font-heading text-[0.625rem] font-bold tracking-[0.18em] text-white backdrop-blur-md">
                <span>{SECURITY_CONTENT.steps[active].num}</span>
                <span className="relative h-px w-8 bg-white/30" aria-hidden="true">
                  <span
                    className="absolute inset-y-0 left-0 bg-brand-red"
                    style={{
                      width: `${((active + 1) / total) * 100}%`,
                      height: '1px',
                      transition: reduced ? 'none' : 'width 0.6s ease-in-out',
                    }}
                  />
                </span>
                <span className="text-white/60">{String(total).padStart(2, '0')}</span>
              </div>

              {/* Rotating quality seal */}
              <div
                className="absolute right-4 top-4 h-[84px] w-[84px] transition-transform duration-500"
                style={{ transform: `scale(${active === total - 1 ? 1.1 : 1})` }}
              >
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 h-full w-full motion-safe:animate-spin drop-shadow-lg"
                  style={{ animationDuration: '26s' }}
                  aria-hidden="true"
                >
                  <circle cx="50" cy="50" r="49" className="fill-white" />
                  <circle cx="50" cy="50" r="46" fill="none" className="stroke-gray-200" strokeWidth="0.6" />
                  <path id="security-seal-circle" d="M50 50 m-35 0 a35 35 0 1 1 70 0 a35 35 0 1 1 -70 0" fill="none" />
                  <text className="fill-brand-black font-heading" fontSize="7.4" fontWeight="700">
                    <textPath href="#security-seal-circle" textLength="216" lengthAdjust="spacing">
                      CONTRÔLE QUALITÉ • CONTRÔLE QUALITÉ •
                    </textPath>
                  </text>
                </svg>
                <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-red font-heading text-[0.8125rem] font-extrabold text-white shadow-md shadow-brand-red/40">
                  QC
                </div>
              </div>

              {/* Step overlay cards (crossfade) */}
              <div className="absolute bottom-4 left-4 right-4 h-[64px] sm:right-auto sm:w-[320px]">
                {SECURITY_CONTENT.steps.map((step, i) => (
                  <div
                    key={step.num}
                    className="absolute inset-0 flex items-center gap-3 rounded-xl border border-white/60 bg-white/92 px-3.5 shadow-xl backdrop-blur-md"
                    style={{
                      opacity: active === i ? 1 : 0,
                      transform: `translateY(${active === i ? 0 : 10}px)`,
                      transition: reduced ? 'none' : `opacity 0.5s ${EASE}, transform 0.5s ${EASE}`,
                      pointerEvents: active === i ? 'auto' : 'none',
                    }}
                    aria-hidden={active !== i}
                  >
                    <StepOverlay index={i} />
                  </div>
                ))}
              </div>
            </div>
          </figure>
        </div>
      </div>
    </section>
  )
}
