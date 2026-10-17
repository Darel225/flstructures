// PROVISIONAL CONTENT - TO BE VALIDATED BY CLIENT
import { useEffect, useState } from 'react'

// ---------------------------------------------------------------------------
// IMAGE DU HERO (Remplaçable dès ajout de realisations-hero.png dans src/assets/images/)
// ---------------------------------------------------------------------------
import heroFallback from '../../../assets/images/RÉALISATIONS.jpg'

// Emplacement propre pour l'image du hero :
// Si vous ajoutez realisations-hero.png dans src/assets/images/, décommentez l'import ci-dessous :
// import realisationsHeroImg from '../../../assets/images/realisations-hero.png'
const REALISATIONS_HERO_IMAGE = heroFallback

const HERO_CONTENT = {
  badge: 'FL STRUCTURES · RÉALISATIONS & RÉFÉRENCES',
  title: 'NOS RÉALISATIONS & RÉFÉRENCES',
  subtitle: 'Études de cas et déploiements logistiques sur bases-vie.',
}

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

export default function RealisationsHero() {
  const [mounted, setMounted] = useState(false)
  const [prefersReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <section className="relative overflow-hidden min-h-[440px] md:min-h-[500px] flex items-center justify-center text-center group bg-brand-black">
      {/* Image de fond avec zoom cinématique ultra-fluide (GPU hardware accelerated) */}
      <img
        src={REALISATIONS_HERO_IMAGE}
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center brightness-[1.05] contrast-[1.03] animate-hero-zoom pointer-events-none"
      />

      {/* Superposition sombre haut de gamme calibrée : photo visible avec contraste luxueux */}
      <div
        className="absolute inset-0 bg-linear-to-b from-black/70 via-black/35 to-black/65 pointer-events-none"
        aria-hidden="true"
      />

      {/* Contenu textuel centré */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 flex flex-col items-center">
        {/* Top Pill Badge */}
        <div
          className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-neutral-900/80 backdrop-blur-md border border-white/20 text-white font-heading text-[0.6875rem] font-bold uppercase tracking-[0.2em] shadow-md mb-6 ${
            prefersReduced
              ? 'opacity-100 translate-y-0'
              : `transition-all duration-700 ${EASE} ${
                  mounted
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-3'
                }`
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-brand-red shrink-0 shadow-xs shadow-brand-red/80" aria-hidden="true" />
          <span>{HERO_CONTENT.badge}</span>
        </div>

        {/* H1 blanc, majuscules, gras équilibré et taille raffinée */}
        <h1
          className={`font-heading font-bold text-white uppercase tracking-[0.02em] text-balance max-w-3xl text-[1.75rem] sm:text-[2.125rem] md:text-[2.5rem] lg:text-[2.625rem] leading-[1.2] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] ${
            prefersReduced
              ? 'opacity-100 translate-y-0'
              : `transition-all duration-700 ${EASE} ${
                  mounted
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-3'
                }`
          }`}
        >
          {HERO_CONTENT.title}
        </h1>

        {/* Filet rouge signature centré */}
        <div
          className="h-0.5 bg-brand-red rounded-full mx-auto my-5 origin-center shadow-xs shadow-brand-red/80"
          style={{
            width: '44px',
            transform: mounted || prefersReduced ? 'scaleX(1)' : 'scaleX(0)',
            transition: prefersReduced
              ? 'none'
              : `transform 0.7s ${EASE} 150ms`,
          }}
          aria-hidden="true"
        />

        {/* Sous-titre blanc/ivoire centré, text-balance pour 2 lignes harmonieuses */}
        <p
          className={`text-white/95 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal text-balance antialiased drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)] ${
            prefersReduced
              ? 'opacity-100 translate-y-0'
              : `transition-all duration-700 ${EASE} delay-250 ${
                  mounted
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-3'
                }`
          }`}
        >
          {HERO_CONTENT.subtitle}
        </p>
      </div>
    </section>
  )
}
