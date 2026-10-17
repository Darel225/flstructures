import { useEffect, useState } from 'react'
import heroImg from '../../../assets/images/about-hero.webp'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

const HERO_CONTENT = {
  badge: "FL STRUCTURES · CORPORATE & ENGAGEMENT",
  title: "L'EXCELLENCE LOGISTIQUE SUR LE TERRAIN",
  subtitle: "Découvrez la raison d'être et l'ambition de FL STRUCTURES.",
}

export default function AboutHero() {
  const [mounted, setMounted] = useState(false)
  const [prefersReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  // Apparition en cascade : fondu + montée
  const fadeUp = (delay) =>
    prefersReduced
      ? undefined
      : {
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(24px)',
          transition: `opacity 1s ${EASE} ${delay}ms, transform 1.1s ${EASE} ${delay}ms`,
        }

  return (
    <section className="relative overflow-hidden min-h-[440px] md:min-h-[500px] flex items-center justify-center text-center group bg-brand-black">
      {/* Image de fond avec zoom cinématique ultra-fluide (GPU hardware accelerated) */}
      <img
        src={heroImg}
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-[center_60%] brightness-[1.05] contrast-[1.03] animate-hero-zoom pointer-events-none"
      />

      {/* Superposition sombre haut de gamme calibrée : photo visible avec contraste luxueux */}
      <div
        className="absolute inset-0 bg-linear-to-b from-black/70 via-black/35 to-black/65 pointer-events-none"
        aria-hidden="true"
      />

      {/* Contenu textuel centré */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 flex flex-col items-center">
        {/* Top Glass Badge */}
        <div
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-neutral-900/80 backdrop-blur-md border border-white/20 text-white font-heading text-[0.6875rem] font-bold uppercase tracking-[0.2em] shadow-md mb-7"
          style={fadeUp(150)}
        >
          <span className="h-2 w-2 rounded-full bg-brand-red shrink-0 shadow-xs shadow-brand-red/80" aria-hidden="true" />
          <span>{HERO_CONTENT.badge}</span>
        </div>

        {/* Main H1 */}
        <h1
          className="font-heading font-bold uppercase text-[1.75rem] sm:text-[2.125rem] md:text-[2.5rem] lg:text-[2.625rem] tracking-[0.02em] text-balance text-white max-w-3xl leading-[1.2] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
          style={fadeUp(300)}
        >
          {HERO_CONTENT.title}
        </h1>

        {/* Refined Red Accent Bar with subtle wings and scaleX trace */}
        <div
          className="flex items-center gap-3 my-5 origin-center"
          aria-hidden="true"
          style={
            prefersReduced
              ? undefined
              : {
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'scaleX(1)' : 'scaleX(0)',
                  transition: `opacity 0.8s ${EASE} 450ms, transform 1s ${EASE} 450ms`,
                }
          }
        >
          <span className="h-px w-8 bg-white/30" />
          <span className="h-0.5 w-14 bg-brand-red rounded-full shadow-md shadow-brand-red/70" />
          <span className="h-px w-8 bg-white/30" />
        </div>

        {/* Subtitle */}
        <p
          className="text-white/95 text-base sm:text-lg max-w-2xl font-normal leading-relaxed text-balance antialiased drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)]"
          style={fadeUp(550)}
        >
          {HERO_CONTENT.subtitle}
        </p>
      </div>
    </section>
  )
}
