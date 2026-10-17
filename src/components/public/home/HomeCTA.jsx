import { useEffect, useRef, useState } from 'react'
import ButtonLink from '../../common/ButtonLink'
import { useDevisModal } from '../../../store/devisModalStore'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

const CTA_CONTENT = {
  overline: 'PARTENARIAT STRATÉGIQUE B2B',
  title: 'Prêt à sécuriser vos approvisionnements miniers ?',
  buttonText: 'Demander un devis',
  link: '/contact',
}

export default function HomeCTA({
  overline = CTA_CONTENT.overline,
  label,
  title = CTA_CONTENT.title,
  subtitle = null,
  text,
  buttonText = CTA_CONTENT.buttonText,
  link = CTA_CONTENT.link,
  bgClass = 'bg-white',
  pill = false,
  withBar = true,
  titleSize = 'large',
  onCtaClick,
} = {}) {
  const { openDevisModal } = useDevisModal()
  const isDevis =
    !onCtaClick &&
    typeof buttonText === 'string' &&
    buttonText.toLowerCase().includes('devis')
  const effectiveOverline = label || overline
  const effectiveSubtitle = text || subtitle

  const sectionRef = useRef(null)
  const [prefersReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const [shown, setShown] = useState(prefersReduced)

  useEffect(() => {
    if (prefersReduced) return
    const node = sectionRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [prefersReduced])

  const words = title.split(' ')
  const WORD_STEP = 85
  const TITLE_START = 250
  const afterTitle = TITLE_START + words.length * WORD_STEP

  // Apparition douce en fondu + montée pour les éléments hors titre
  const fadeUp = (delay) =>
    prefersReduced
      ? undefined
      : {
          opacity: shown ? 1 : 0,
          transform: shown ? 'translateY(0)' : 'translateY(18px)',
          transition: `opacity 0.9s ${EASE} ${delay}ms, transform 1s ${EASE} ${delay}ms`,
        }

  return (
    <section
      ref={sectionRef}
      className={`relative py-16 md:py-24 overflow-hidden border-t border-gray-100 ${bgClass}`}
    >
      {/* Filet supérieur qui se trace depuis le centre */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px bg-gray-200/80 origin-center"
        style={
          prefersReduced
            ? undefined
            : {
                transform: shown ? 'scaleX(1)' : 'scaleX(0)',
                transition: `transform 1.4s ${EASE}`,
              }
        }
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Badge sur-titre ciselé ou pastille */}
        {pill ? (
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200/90 bg-white font-heading text-[0.625rem] font-bold uppercase tracking-[0.18em] text-brand-red mb-4 shadow-2xs"
            style={fadeUp(0)}
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0"
              aria-hidden="true"
            />
            <span>{effectiveOverline}</span>
            <span
              className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0"
              aria-hidden="true"
            />
          </div>
        ) : (
          <div
            className="flex items-center gap-2 mb-3"
            style={fadeUp(0)}
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0"
              aria-hidden="true"
            />
            <span className="text-[0.6rem] font-heading font-bold uppercase tracking-[0.18em] text-brand-red">
              {effectiveOverline}
            </span>
          </div>
        )}

        {/* Titre : révélation mot à mot depuis un masque */}
        <h2
          aria-label={title}
          className={`${
            titleSize === 'large'
              ? 'font-heading font-bold text-[1.3125rem] sm:text-[1.5rem] md:text-[1.75rem] tracking-tight text-brand-black mb-3.5 max-w-2xl mx-auto leading-snug'
              : 'font-heading font-bold text-[1.125rem] sm:text-[1.25rem] text-brand-black mb-2 max-w-2xl mx-auto leading-snug'
          }`}
        >
          {words.map((word, i) => (
            <span
              key={`${word}-${i}`}
              aria-hidden="true"
              className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]"
            >
              <span
                className="inline-block"
                style={
                  prefersReduced
                    ? undefined
                    : {
                        transform: shown ? 'translateY(0)' : 'translateY(110%)',
                        transition: `transform 1s ${EASE} ${
                          TITLE_START + i * WORD_STEP
                        }ms`,
                      }
                }
              >
                {word}
                {i < words.length - 1 ? '\u00A0' : ''}
              </span>
            </span>
          ))}
        </h2>

        {/* Ligne d'accentuation rouge signature (optionnelle) */}
        {withBar && (
          <div
            className="h-0.5 w-8 bg-brand-red rounded-full mb-3.5 origin-center mx-auto"
            style={
              prefersReduced
                ? undefined
                : {
                    transform: shown ? 'scaleX(1)' : 'scaleX(0)',
                    transition: `transform 0.9s ${EASE} ${afterTitle}ms`,
                  }
            }
          />
        )}

        {/* Sous-titre optionnel si spécifié */}
        {effectiveSubtitle && (
          <p
            className={`text-gray-600 max-w-xl mx-auto mb-7 font-normal ${
              titleSize === 'large'
                ? 'text-[0.84375rem] sm:text-[0.875rem] leading-[1.65]'
                : 'text-[0.8125rem] sm:text-[0.84375rem] leading-[1.65]'
            }`}
            style={fadeUp(afterTitle + 100)}
          >
            {effectiveSubtitle}
          </p>
        )}

        {/* Bouton d'action principal avec reflet lumineux au survol */}
        <div style={fadeUp(afterTitle + (subtitle ? 250 : 150))}>
          <ButtonLink
            to={onCtaClick || isDevis ? undefined : link}
            onClick={
              onCtaClick ||
              (isDevis
                ? () => openDevisModal({ type_besoin: 'Approvisionnement & Logistique B2B' })
                : undefined)
            }
            variant="primary"
            size="md"
            className="relative overflow-hidden motion-safe:hover:-translate-y-0.5 after:absolute after:inset-y-0 after:-left-1/2 after:w-1/2 after:-skew-x-12 after:-translate-x-full after:bg-white/25 after:transition-transform after:duration-700 hover:after:translate-x-[320%]"
          >
            {buttonText}
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
