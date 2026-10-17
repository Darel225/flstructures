import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import SectionIntro from '../../common/SectionIntro'
import useReveal from '../../../hooks/useReveal'
import imgGamme from '../../../assets/images/expertise-gamme1.jpg'
import imgHebergement from '../../../assets/images/hebergement.jpg'
import imgLogistique from '../../../assets/images/expertise-logistique.jpg'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

const EXPERTISE_CARDS = [
  {
    pole: 'PÔLE 01 · MINES & TRANSPORT',
    title: 'LOGISTIQUE OPÉRATIONNELLE',
    description:
      'Planification des rotations, coordination transport et livraison sécurisée sur site minier.',
    actionLabel: 'EN SAVOIR PLUS',
    link: '/services',
    image: imgLogistique,
  },
  {
    pole: 'PÔLE 02 · APPROVISIONNEMENT',
    title: 'GAMME ALIMENTAIRE B2B',
    description:
      'Produits secs, frais et carnés rigoureusement sourcés selon vos mercuriales.',
    actionLabel: 'DÉCOUVRIR LE CATALOGUE',
    link: '/produits',
    image: imgGamme,
  },
  {
    pole: 'PÔLE 03 · HOSPITALITY B2B',
    title: 'HÉBERGEMENT CORPORATE',
    description:
      'Résidences urbaines équipées pour le confort de vos cadres et consultants.',
    actionLabel: 'CONSULTER LES OFFRES',
    link: '/hebergement',
    image: imgHebergement,
  },
]

export default function ExpertiseSection() {
  const { ref: gridRef, shown, prefersReduced } = useReveal({
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px',
  })

  return (
    <section className="bg-brand-cream py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionIntro
          align="left"
          withBar={true}
          overline="SOLUTIONS CLÉS EN MAIN"
          title="PÔLES D'EXPERTISE"
          subtitle="Des solutions intégrées pour sécuriser et optimiser vos bases-vie."
          titleClassName="font-heading font-extrabold text-[1.25rem] sm:text-[1.4rem] md:text-[1.55rem] text-brand-black leading-snug tracking-tight"
          subtitleClassName="text-[0.875rem] sm:text-[0.9375rem] md:text-[1rem] text-gray-600 leading-relaxed mt-3 max-w-2xl font-normal"
        />

        {/* Grille avec animation d'apparition en cascade synchronisée (un à un) */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-10"
        >
          {EXPERTISE_CARDS.map((card, i) => {
            const delay = 180 + i * 280
            const cardRevealStyle = prefersReduced
              ? undefined
              : {
                  opacity: shown ? 1 : 0,
                  transform: shown
                    ? 'translateY(0) scale(1)'
                    : 'translateY(48px) scale(0.96)',
                  filter: shown ? 'blur(0)' : 'blur(5px)',
                  transition: `opacity 1.05s ${EASE} ${delay}ms, transform 1.15s ${EASE} ${delay}ms, filter 0.9s ${EASE} ${delay}ms`,
                }

            return (
              <div
                key={card.pole}
                className="flex"
                style={cardRevealStyle}
              >
                <Link
                  to={card.link}
                  className="group relative overflow-hidden rounded-xl w-full min-h-[440px] lg:min-h-[460px] flex flex-col justify-end p-6 md:p-7 border border-black/10 shadow-sm hover:shadow-2xl transition-all duration-500 motion-safe:hover:-translate-y-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                >
                  {/* Image d'arrière-plan sans déformation avec zoom lent au hover */}
                  <img
                    src={card.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000 ease-out motion-safe:group-hover:scale-[1.05]"
                  />

                  {/* Dégradé sombre progressif multi-paliers pour une lisibilité parfaite */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/60 via-45% to-black/15 to-80% pointer-events-none" />

                  {/* Badge supérieur ciselé avec pastille de marque */}
                  <div className="absolute top-5 left-5 inline-flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 font-heading text-[0.6rem] font-bold uppercase tracking-[0.18em] text-white/95 shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0" />
                    <span>{card.pole}</span>
                  </div>

                  {/* Contenu textuel en bas de carte */}
                  <div className="relative z-10 flex flex-col mt-auto">
                    <h3 className="font-heading font-bold uppercase text-[1.125rem] sm:text-[1.25rem] text-white tracking-wide mb-2.5 leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-[0.8125rem] sm:text-[0.84375rem] text-white/85 leading-[1.65] font-normal mb-5 antialiased">
                      {card.description}
                    </p>

                    {/* Filet et CTA de bas de carte */}
                    <div className="border-t border-white/15 pt-4 flex items-center justify-between">
                      <span className="font-heading text-[0.6rem] sm:text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-white/90 group-hover:text-white transition-colors">
                        {card.actionLabel}
                      </span>
                      <div className="h-8 w-8 rounded-full border border-white/30 bg-white/10 text-white flex items-center justify-center transition-all duration-300 group-hover:bg-brand-red group-hover:border-brand-red shrink-0">
                        <ArrowRight
                          size={14}
                          className="transition-transform duration-300 motion-safe:group-hover:translate-x-0.5"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
