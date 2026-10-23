// PROVISIONAL CONTENT - TO BE VALIDATED BY CLIENT
import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import ButtonLink from '../../common/ButtonLink'

// ---------------------------------------------------------------------------
// IMAGES DES SERVICES
// ---------------------------------------------------------------------------
import imgSourcingProvisoire from '../../../assets/images/Approvisionnement.webp'
import imgStocksProvisoire from '../../../assets/images/8.png'
import imgLivraisonProvisoire from '../../../assets/images/Livraison.jpg'
import imgQualiteProvisoire from '../../../assets/images/2.png'
import imgSurMesureProvisoire from '../../../assets/images/Logistique.jpg'

const SERVICES_IMAGES = {
  sourcing: imgSourcingProvisoire, // Racks d'entrepôt logistique
  stocks: imgStocksProvisoire, // Stockage industriel sous température dirigée (-25°C)
  livraison: imgLivraisonProvisoire, // Convois et livraison sécurisée sur site
  qualite: imgQualiteProvisoire, // Contrôle sanitaire et chaîne du froid HACCP
  surMesure: imgSurMesureProvisoire, // Véhicules et acheminement sur pistes d'accès difficiles
}

const SERVICES_DATA = [
  {
    num: '01',
    label: 'SERVICE 01',
    title: 'Sourcing & Sélection Fournisseurs',
    paragraph:
      'Un sourcing rigoureux et une fourniture conforme à votre mercuriale. Nous respectons vos spécifications, vos volumes et vos fréquences de livraison afin de garantir la qualité des produits et la continuité des approvisionnements sur vos bases-vie. Grâce à une sélection rigoureuse des fournisseurs et à un suivi régulier des commandes, nous veillons à répondre efficacement à vos besoins tout en respectant les exigences de qualité et les délais convenus.',
    points: ['Fourniture selon mercuriale', 'Respect strict des volumes'],
    image: SERVICES_IMAGES.sourcing,
    alt: 'Sourcing rigoureux et sélection fournisseurs selon mercuriale minière',
    bgLight: false, // Fond blanc
  },
  {
    num: '02',
    label: 'SERVICE 02',
    title: 'Approvisionnement & Gestion des Stocks Récurrents',
    paragraph:
      'Une organisation proactive des commandes programmées pour anticiper vos besoins et limiter les risques de rupture de stock sur vos bases-vie. Grâce à un suivi régulier des consommations et à une planification adaptée des approvisionnements, nous veillons à maintenir la disponibilité des produits essentiels et à garantir la continuité de vos activités. Cette approche nous permet d’ajuster les quantités selon vos besoins réels, d’optimiser la gestion des stocks et d’assurer un approvisionnement régulier, fiable et adapté aux exigences de votre site.',
    points: ['Commandes programmées', 'Sécurisation continue des stocks'],
    image: SERVICES_IMAGES.stocks,
    alt: 'Approvisionnement continu et gestion des stocks en chambre froide pour bases-vie',
    bgLight: true, // Fond #F8F6F4
  },
  {
    num: '03',
    label: 'SERVICE 03',
    title: 'Logistique & Livraison Sécurisée sur Sites Miniers',
    paragraph:
      "Maîtrise totale de la chaîne de transport, de la planification des rotations à la coordination des convois. Nous veillons à optimiser les itinéraires, à respecter les délais convenus et à assurer une livraison ponctuelle et sécurisée jusqu’à votre site, même dans les zones les plus difficiles d’accès. Un suivi rigoureux des marchandises permet également de garantir une meilleure traçabilité et une coordination efficace à chaque étape du transport.",
    points: ['Planification des rotations', 'Livraison sur site et suivi'],
    image: SERVICES_IMAGES.livraison,
    alt: 'Convois de transport et livraison sécurisée de denrées sur site minier isolé',
    bgLight: false, // Fond blanc
  },
  {
    num: '04',
    label: 'SERVICE 04',
    title: 'Contrôle Qualité & Traçabilité Sanitaire',
    paragraph:
      'Une vérification rigoureuse des produits, des conditionnements et de la conformité documentaire à chaque étape de l’approvisionnement. Nous veillons au respect des exigences de qualité et assurons une traçabilité fiable des marchandises afin de garantir leur conformité et de faciliter le suivi des livraisons jusqu’à votre site. Des contrôles réguliers permettent également d’identifier les éventuelles anomalies, de limiter les risques liés aux non-conformités et de garantir une meilleure transparence tout au long de la chaîne logistique.',
    points: ['Conformité documentaire', 'Inspection des conditionnements'],
    image: SERVICES_IMAGES.qualite,
    alt: 'Contrôle qualité HACCP et traçabilité sanitaire des denrées alimentaires',
    bgLight: true, // Fond #F8F6F4
  },
  {
    num: '05',
    label: 'SERVICE 05',
    title: 'Solutions Logistiques Sur Mesure & Accès Difficiles',
    paragraph:
      'Des solutions adaptées aux contraintes spécifiques de chaque site, tenant compte de la saisonnalité, des variations de volumes et des imprévus opérationnels. Nous ajustons nos moyens logistiques à vos besoins afin de garantir la continuité des approvisionnements et une gestion efficace des urgences. Grâce à une organisation flexible et une bonne coordination avec vos équipes, nous apportons des réponses rapides et adaptées à vos exigences opérationnelles.',
    points: ['Adaptation aux accès difficiles', 'Gestion des urgences'],
    image: SERVICES_IMAGES.surMesure,
    alt: 'Solutions logistiques personnalisées et adaptation aux accès difficiles',
    bgLight: false, // Fond blanc
    hasCTA: true,
    ctaText: 'DEMANDER UNE ÉTUDE PERSONNALISÉE',
    ctaLink: '/contact',
  },
]

function ServiceBlock({ service, index, prefersReduced }) {
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
      { threshold: 0.25 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [prefersReduced])

  const isEven = index % 2 === 1 // Blocs pairs (02, 04)
  const easeCurve = 'cubic-bezier(0.22, 1, 0.36, 1)'

  const photoRevealStyle = prefersReduced
    ? {}
    : {
        clipPath: isRevealed
          ? 'inset(0% 0% 0% 0% round 1.5rem)'
          : isEven
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
    <section
      id={`service-${service.num}`}
      ref={rowRef}
      className={`w-full py-10 md:py-14 lg:py-16 border-b border-gray-100 scroll-mt-24 md:scroll-mt-28 ${
        service.bgLight ? 'bg-[#F8F6F4]' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20 items-center">
          {/* Colonne Image (~58% desktop, lg:col-span-7) */}
          <div
            className={`w-full lg:col-span-7 order-1 ${
              isEven ? 'lg:order-1' : 'lg:order-2'
            }`}
          >
            <div
              style={photoRevealStyle}
              className="relative overflow-hidden rounded-3xl bg-gray-100 shadow-xl aspect-[4/3] group cursor-pointer"
            >
              <div
                style={imageScaleStyle}
                className="w-full h-full overflow-hidden"
              >
                <img
                  src={service.image}
                  alt={service.alt}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover select-none transition-transform duration-1000 ease-out will-change-transform motion-safe:group-hover:scale-[1.035]"
                />
              </div>
            </div>
          </div>

          {/* Colonne Texte (~42% desktop, lg:col-span-5) */}
          <div
            className={`w-full lg:col-span-5 flex flex-col justify-center order-2 ${
              isEven ? 'lg:order-2' : 'lg:order-1'
            }`}
          >
            {/* Entête de service : Étiquette rouge + Grand numéro élégant */}
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
                  {service.label}
                </span>
              </div>

              <span
                className="font-heading font-black text-3xl sm:text-4xl text-gray-200/90 select-none tracking-tight leading-none"
                aria-hidden="true"
              >
                {service.num}
              </span>
            </div>

            {/* Titre fort du service */}
            <h2
              className={`font-heading font-bold text-[1.125rem] sm:text-[1.25rem] text-brand-black leading-snug ${textFadeClass(
                'delay-200'
              )}`}
            >
              {service.title}
            </h2>

            {/* Filet rouge animé qui se trace sous le titre */}
            <div
              className="h-0.5 bg-brand-red mt-2 origin-left"
              style={{
                width: '32px',
                transform:
                  isRevealed || prefersReduced ? 'scaleX(1)' : 'scaleX(0)',
                transition: prefersReduced
                  ? 'none'
                  : `transform 0.8s ${easeCurve} 300ms`,
              }}
              aria-hidden="true"
            />

            {/* Paragraphe descriptif : typographie rigoureusement identique à AboutCapabilities */}
            <p
              className={`text-[0.8125rem] sm:text-[0.84375rem] text-gray-600 leading-[1.65] mt-3.5 mb-5 font-normal ${textFadeClass(
                'delay-350'
              )}`}
            >
              {service.paragraph}
            </p>

            {/* 2 points clés séparés par de fins filets gris */}
            <div
              className={`border-y border-gray-200/70 divide-y divide-gray-200/70 mb-6 ${textFadeClass(
                'delay-500'
              )}`}
            >
              {service.points.map((point) => (
                <div key={point} className="py-2.5 flex items-center gap-2.5">
                  <div
                    className="h-4 w-4 rounded-full border border-brand-red/30 bg-brand-red/10 flex items-center justify-center shrink-0"
                    aria-hidden="true"
                  >
                    <Check
                      size={10}
                      strokeWidth={2.8}
                      className="text-brand-red"
                    />
                  </div>
                  <span className="font-heading font-semibold text-[0.8125rem] sm:text-[0.84375rem] text-gray-700 tracking-wide">
                    {point}
                  </span>
                </div>
              ))}
            </div>

            {/* Bouton du service 05 */}
            {service.hasCTA && (
              <div className={`mt-6 pt-1 ${textFadeClass('delay-650')}`}>
                <ButtonLink
                  to={service.ctaLink}
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto shadow-sm hover:shadow-md"
                >
                  {service.ctaText}
                </ButtonLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function ServicesList() {
  const [prefersReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  return (
    <div className="flex flex-col w-full">
      {/* Rendu des 5 blocs de services en zig-zag */}
      {SERVICES_DATA.map((service, index) => (
        <ServiceBlock
          key={service.num}
          service={service}
          index={index}
          prefersReduced={prefersReduced}
        />
      ))}
    </div>
  )
}
