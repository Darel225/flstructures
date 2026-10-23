// PROVISIONAL CONTENT - TO BE VALIDATED BY CLIENT
import { useEffect, useRef, useState } from 'react'
import ButtonLink from '../../common/ButtonLink'
import useReveal from '../../../hooks/useReveal'

// ---------------------------------------------------------------------------
// IMAGES PAR DÉFAUT (Remplaçables par vos photos finales)
// ---------------------------------------------------------------------------
// Pilier 01 - RH & Terrain : Photo d'équipes/acheteurs/logisticiens sur site
import imgTerrainDefault from '../../../assets/images/Humaine.png'
// Pilier 02 - Plateformes : Espace de stockage / entrepôt de denrées
import imgStockageDefault from '../../../assets/images/Stockage.jpg'
// Pilier 03 - Convois & Matériel : Flotte de camions / transport adapté
import imgLogistiqueDefault from '../../../assets/images/flotte-logistique.jpg'

const CAPABILITIES_IMAGES = {
  rhTerrain: imgTerrainDefault,
  stockage: imgStockageDefault,
  logistique: imgLogistiqueDefault,
}

const CAPABILITIES_CONTENT = {
  eyebrow: 'NOTRE FORCE DE FRAPPE',
  title: 'Équipe et capacité opérationnelle',
  subtitle:
    'Une chaîne de valeur robuste et une présence locale structurée pour répondre aux exigences minières.',
  chapters: [
    {
      num: '01',
      overline: 'RH & TERRAIN',
      title: 'Expertise Humaine',
      description:
        'Des acheteurs spécialisés et des logisticiens expérimentés, maîtrisant les exigences du secteur minier et les réalités du terrain. Leur expertise permet d’assurer un approvisionnement efficace, une coordination optimale des opérations et une réponse adaptée aux besoins spécifiques de chaque site. Grâce à leur savoir-faire et à leur réactivité, ils veillent au respect des délais, à la bonne gestion des ressources et à la continuité des activités, tout en maintenant un niveau de service fiable et professionnel.',
      footer: 'Proximité terrain',
      image: CAPABILITIES_IMAGES.rhTerrain,
      imageAlt:
        'Équipes et encadrement logistique intervenant sur les sites miniers en Côte d’Ivoire',
      reverse: false,
    },
    {
      num: '02',
      overline: 'PLATEFORMES',
      title: 'Infrastructures de Stockage',
      description:
        'Des espaces de stockage adaptés aux produits secs, frais et surgelés, conçus pour préserver la qualité et l’intégrité des denrées. Nos installations assurent une gestion rigoureuse des stocks, une organisation optimale des marchandises et des conditions de conservation adaptées à chaque type de produit, tout en limitant les risques de détérioration. Nous veillons également au respect des bonnes pratiques de stockage afin de faciliter la gestion des approvisionnements et de garantir la disponibilité des produits selon les besoins de chaque site.',
      footer: 'Chaîne du froid maîtrisée',
      image: CAPABILITIES_IMAGES.stockage,
      imageAlt:
        'Infrastructures de stockage sécurisées pour produits secs, frais et surgelés',
      reverse: true,
    },
    {
      num: '03',
      overline: 'CONVOIS & MATÉRIEL',
      title: 'Flotte Logistique Adaptée',
      description:
        'Des véhicules adaptés au transport des denrées et aux accès difficiles des sites miniers. Notre flotte permet d’assurer l’acheminement des marchandises dans de bonnes conditions, tout en garantissant des livraisons fiables et ponctuelles, même vers les sites les plus éloignés. Grâce à une planification rigoureuse des itinéraires et à une organisation efficace des rotations, nous veillons à la sécurité des produits et au respect des délais de livraison.',
      footer: 'Livraison sur sites éloignés',
      image: CAPABILITIES_IMAGES.logistique,
      imageAlt:
        'Véhicules de transport logistique adaptés aux pistes et zones isolées',
      reverse: false,
      cta: {
        label: 'DÉCOUVRIR NOS SERVICES',
        to: '/services',
      },
    },
  ],
}

function CapabilityChapter({ chapter, prefersReduced }) {
  const rowRef = useRef(null)
  const [isRevealed, setIsRevealed] = useState(prefersReduced)

  useEffect(() => {
    if (prefersReduced) {
      return
    }

    const node = rowRef.current
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

  // Courbe douce de transition pour le démasquage
  const easeCurve = 'cubic-bezier(0.22, 1, 0.36, 1)'

  const photoRevealStyle = prefersReduced
    ? {}
    : {
        clipPath: isRevealed
          ? 'inset(0% 0% 0% 0% round 1.5rem)'
          : chapter.reverse
            ? 'inset(0% 0% 0% 100% round 1.5rem)'
            : 'inset(0% 100% 0% 0% round 1.5rem)',
        transition: `clip-path 1.05s ${easeCurve}`,
      }

  const imageScaleStyle = prefersReduced
    ? {}
    : {
        transform: isRevealed ? 'scale(1)' : 'scale(1.08)',
        transition: `transform 1.2s ${easeCurve}`,
      }

  const textFadeClass = (delayClass) =>
    prefersReduced
      ? 'opacity-100 translate-y-0'
      : `transition-all duration-700 ${easeCurve} ${delayClass} ${
          isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`

  return (
    <article
      ref={rowRef}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 xl:gap-16 items-center"
      aria-label={`${chapter.overline} : ${chapter.title}`}
    >
      {/* Colonne Image (environ 55% de la largeur desktop, col-span-7) */}
      <div
        className={`w-full lg:col-span-7 ${
          chapter.reverse ? 'lg:order-2' : 'lg:order-1'
        }`}
      >
        <div
          style={photoRevealStyle}
          className="relative overflow-hidden rounded-3xl bg-gray-100 shadow-sm border border-black/5 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] group cursor-pointer"
        >
          {/* Conteneur d'apparition doux sans conflit avec le hover */}
          <div
            style={imageScaleStyle}
            className="w-full h-full overflow-hidden"
          >
            <img
              src={chapter.image}
              alt={chapter.imageAlt}
              loading="lazy"
              className="w-full h-full object-cover select-none transition-transform duration-1000 ease-out will-change-transform motion-safe:group-hover:scale-[1.035]"
            />
          </div>
        </div>
      </div>

      {/* Colonne Texte (environ 45% de la largeur desktop, col-span-5) */}
      <div
        className={`w-full lg:col-span-5 flex flex-col justify-center ${
          chapter.reverse ? 'lg:order-1' : 'lg:order-2'
        }`}
      >
        {/* Entête de pilier : Étiquette rouge + Grand numéro élégant */}
        <div
          className={`flex items-baseline justify-between gap-4 mb-2 ${textFadeClass(
            'delay-100'
          )}`}
        >
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0"
              aria-hidden="true"
            />
            <span className="text-[0.6rem] font-heading font-bold uppercase tracking-[0.18em] text-brand-red">
              {chapter.overline}
            </span>
          </div>

          <span
            className="font-heading font-black text-3xl sm:text-4xl text-gray-200/90 select-none tracking-tight leading-none"
            aria-hidden="true"
          >
            {chapter.num}
          </span>
        </div>

        {/* Titre fort du pilier */}
        <h3
          className={`font-heading font-bold text-[1.125rem] sm:text-[1.25rem] text-brand-black leading-snug ${textFadeClass(
            'delay-200'
          )}`}
        >
          {chapter.title}
        </h3>

        {/* Filet rouge animé qui se trace sous le titre */}
        <div
          className="h-0.5 bg-brand-red mt-2 origin-left"
          style={{
            width: '32px',
            transform: isRevealed || prefersReduced ? 'scaleX(1)' : 'scaleX(0)',
            transition: prefersReduced
              ? 'none'
              : `transform 0.8s ${easeCurve} 300ms`,
          }}
          aria-hidden="true"
        />

        {/* Paragraphe descriptif : typographie rigoureusement identique au bloc Mission */}
        <p
          className={`text-[0.8125rem] sm:text-[0.84375rem] text-gray-600 leading-[1.65] mt-3.5 mb-5 font-normal ${textFadeClass(
            'delay-350'
          )}`}
        >
          {chapter.description}
        </p>

        {/* Pied de pilier : Point vert + Filet fin au-dessus */}
        <div
          className={`border-t border-gray-200/70 pt-3.5 flex items-center justify-between ${textFadeClass(
            'delay-500'
          )}`}
        >
          <div className="flex items-center gap-2.5 text-[0.6875rem] sm:text-xs font-heading font-semibold uppercase tracking-wider text-gray-600">
            <span
              className="h-1.5 w-1.5 rounded-full bg-brand-green shrink-0 shadow-xs shadow-brand-green/80"
              aria-hidden="true"
            />
            <span>{chapter.footer}</span>
          </div>

          <span className="font-mono text-[0.6875rem] font-bold text-gray-400 tracking-wider">
            N° {chapter.num}
          </span>
        </div>

        {/* Bouton d'action intégré directement sous le pilier */}
        {chapter.cta && (
          <div className={`mt-7 pt-1 ${textFadeClass('delay-600')}`}>
            <ButtonLink
              to={chapter.cta.to}
              variant="primary"
              size="md"
              className="w-full sm:w-auto shadow-sm hover:shadow-md"
            >
              {chapter.cta.label}
            </ButtonLink>
          </div>
        )}
      </div>
    </article>
  )
}

export default function AboutCapabilities() {
  const { ref: headerRef, shown: headerShown, prefersReduced } = useReveal({
    threshold: 0.2,
    rootMargin: '0px 0px -60px 0px',
  })

  const fadeUp = (delay) =>
    prefersReduced
      ? undefined
      : {
          opacity: headerShown ? 1 : 0,
          transform: headerShown ? 'translateY(0)' : 'translateY(20px)',
          transition: `opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 1s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        }

  return (
    <section className="bg-brand-cream py-16 md:py-24 border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Entête de section : sobre, centré, avec révélation fluide */}
        <header ref={headerRef} className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          {/* Pastille */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200/90 bg-white font-heading text-[0.625rem] font-bold uppercase tracking-[0.18em] text-brand-red mb-4 shadow-xs"
            style={fadeUp(50)}
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0"
              aria-hidden="true"
            />
            <span>{CAPABILITIES_CONTENT.eyebrow}</span>
          </div>

          {/* Titre : taille légèrement augmentée pour un impact optimal */}
          <h2
            className="font-heading font-extrabold text-[1.625rem] sm:text-[1.875rem] lg:text-[2.1rem] text-brand-black text-balance leading-[1.2] tracking-tight"
            style={fadeUp(180)}
          >
            {CAPABILITIES_CONTENT.title}
          </h2>

          {/* Filet rouge centré avec animation d'étirement */}
          <div
            className="h-0.5 w-12 bg-brand-red mx-auto mt-3.5 origin-center"
            style={
              prefersReduced
                ? undefined
                : {
                    transform: headerShown ? 'scaleX(1)' : 'scaleX(0)',
                    transition: 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 320ms',
                  }
            }
            aria-hidden="true"
          />

          {/* Sous-titre : taille augmentée et interlignage confortable */}
          <p
            className="text-[0.9375rem] sm:text-[1rem] md:text-[1.0625rem] text-gray-600 leading-relaxed max-w-2xl mx-auto mt-4 font-normal"
            style={fadeUp(400)}
          >
            {CAPABILITIES_CONTENT.subtitle}
          </p>
        </header>

        {/* Trois chapitres éditoriaux empilés verticalement avec alternance */}
        <div className="space-y-16 md:space-y-24 lg:space-y-28">
          {CAPABILITIES_CONTENT.chapters.map((chapter) => (
            <CapabilityChapter
              key={chapter.num}
              chapter={chapter}
              prefersReduced={prefersReduced}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
