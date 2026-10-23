import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import ButtonLink from '../../common/ButtonLink'
import { useDevisModal } from '../../../store/devisModalStore'
import bgHero from '../../../assets/images/hero-mines1.webp'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

const HERO_CONTENT = {
  badge: "CÔTE D'IVOIRE • SITES MINIERS & RESTAURATION COLLECTIVE",
  titlePart1: 'Votre partenaire ',
  titleHighlight: "d'approvisionnement et de logistique",
  titlePart2: ' alimentaire pour sites miniers et restauration collective',
  subtitle:
    "Continuité d'approvisionnement, qualité, ponctualité et proximité terrain.",
  ctaPrimary: 'DEMANDER UN DEVIS',
  ctaSecondary: 'DÉCOUVRIR NOS SERVICES',
}

export default function HeroSection() {
  const { openDevisModal } = useDevisModal()
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
    <section className="relative overflow-hidden bg-brand-black h-[calc(100svh-var(--header-h))] min-h-[520px] max-h-[800px] flex items-center">
      {/* Conteneur image : plein cadre sous lg, calé à droite (w-[78%]) avec fondu gauche à partir de lg */}
      <div className="absolute inset-0 lg:left-auto lg:right-0 lg:w-[78%] h-full lg:hero-mask-fade pointer-events-none">
        <img
          src={bgHero}
          alt=""
          fetchPriority="high"
          className="h-full w-full object-cover object-[60%_center] lg:object-[center_55%]"
          style={
            prefersReduced
              ? undefined
              : {
                  transform: mounted ? 'scale(1)' : 'scale(1.07)',
                  transition: `transform 2s ${EASE}`,
                }
          }
        />
      </div>

      {/* Voile uniforme léger (50% sur mobile, 15% à partir de lg) */}
      <div className="absolute inset-0 bg-black/50 lg:bg-black/15 pointer-events-none" />

      {/* Dégradé renforcé gauche -> droite pour contraste optimal du texte */}
      <div className="absolute inset-0 bg-linear-to-r from-black/10 via-black/65 to-black/20 pointer-events-none" />

      {/* Léger vignettage en bas */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/50 to-transparent pointer-events-none" />

      {/* Contenu textuel */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 md:pb-24">
        <div className="max-w-4xl text-left text-white flex flex-col items-start gap-5 md:gap-6">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-green/40 bg-black/40 backdrop-blur-xs"
            style={fadeUp(150)}
          >
            <Check className="h-3.5 w-3.5 text-brand-green shrink-0" />
            <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-gray-200">
              {HERO_CONTENT.badge}
            </span>
          </div>

          {/* Titre H1 principal (3 lignes max sur desktop) */}
          <h1
            className="font-heading font-extrabold text-display tracking-tight text-white leading-tight"
            style={fadeUp(300)}
          >
            {HERO_CONTENT.titlePart1}
            <span className="text-brand-red">
              {HERO_CONTENT.titleHighlight}
            </span>
            {HERO_CONTENT.titlePart2}
          </h1>

          {/* Sous-titre */}
          <p
            className="text-base md:text-lg text-white/85 max-w-xl leading-relaxed"
            style={fadeUp(480)}
          >
            {HERO_CONTENT.subtitle}
          </p>

          {/* Boutons d'action (empilés pleine largeur sur mobile, côte à côte dès sm) */}
          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 w-full sm:w-auto pt-1"
            style={fadeUp(640)}
          >
            <ButtonLink
              onClick={() =>
                openDevisModal({ type_besoin: 'Approvisionnement alimentaire complet selon mercuriale' })
              }
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
            >
              {HERO_CONTENT.ctaPrimary}
            </ButtonLink>

            <ButtonLink
              to="/services"
              variant="outline-light"
              size="md"
              showArrow={false}
              className="w-full sm:w-auto"
            >
              {HERO_CONTENT.ctaSecondary}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}
