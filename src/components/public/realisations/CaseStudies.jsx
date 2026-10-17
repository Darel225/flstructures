import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getRealisations } from '../../../services/api/realisation.service'
import { resolveImageUrl, handleImageError } from '../../../utils/imageResolver'

import imgNordFallback from '../../../assets/images/expertise-logistique.jpg'
import imgSudFallback from '../../../assets/images/expertise-logistique.png'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const ITEMS_PER_PAGE = 4

function CaseStudy({ item, index, currentPage, prefersReduced }) {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(prefersReduced)

  useEffect(() => {
    if (prefersReduced) return

    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.18 }
    )

    observer.observe(node)

    // Sécurité de repli
    const safetyTimer = setTimeout(() => {
      setIsVisible(true)
    }, 1500)

    return () => {
      observer.disconnect()
      clearTimeout(safetyTimer)
    }
  }, [prefersReduced])

  // Style de transition d'entrée
  const animStyle = (delayMs) =>
    prefersReduced
      ? undefined
      : {
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
          transition: `opacity 0.8s ${EASE} ${delayMs}ms, transform 0.8s ${EASE} ${delayMs}ms`,
        }

  // Alternance stricte de la disposition pour préserver l'esthétique existante
  const isOdd = index % 2 === 1
  const reverse = isOdd
  const bgClass = isOdd ? 'bg-[#F8F6F4]' : 'bg-white'
  const variant = isOdd ? 'white' : 'border'
  const fallbackImg = isOdd ? imgSudFallback : imgNordFallback

  const overline = `ÉTUDE DE CAS ${String((currentPage - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, '0')}`

  const blocks = isOdd
    ? [
        {
          tag: 'LE BESOIN :',
          text: item.besoin_client_fr,
          dotColor: 'bg-[#C0392B]',
        },
        {
          tag: 'LES CONTRAINTES :',
          text: item.contraintes_fr,
          dotColor: 'bg-[#C0392B]',
        },
        {
          tag: 'LA SOLUTION :',
          text: item.solution_fr,
          dotColor: 'bg-brand-green',
        },
      ]
    : [
        {
          tag: 'Le Besoin :',
          text: item.besoin_client_fr,
          borderColor: 'border-l-[#C0392B]',
        },
        {
          tag: 'Les Contraintes :',
          text: item.contraintes_fr,
          borderColor: 'border-l-slate-400',
        },
        {
          tag: 'La Solution :',
          text: item.solution_fr,
          borderColor: 'border-l-brand-green',
        },
      ]

  const dateText = item.date_realisation
    ? item.date_realisation.toUpperCase().startsWith('DATE')
      ? item.date_realisation
      : `DATE DE RÉALISATION : ${item.date_realisation}`
    : 'DATE DE RÉALISATION : 2026'

  return (
    <section
      id={`etude-cas-${item.id || index}`}
      ref={sectionRef}
      className={`w-full py-16 md:py-24 border-b border-gray-100 ${bgClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
          {/* Colonne Image : order-1 sur mobile/tablette (toujours au-dessus) */}
          <figure
            className={`relative group min-h-[340px] sm:min-h-[420px] lg:min-h-0 order-1 ${
              reverse ? 'lg:order-1' : 'lg:order-2'
            }`}
            style={animStyle(0)}
          >
            <div className="absolute inset-0 overflow-hidden rounded-2xl shadow-2xl border border-gray-200/90 bg-brand-black">
              <img
                src={resolveImageUrl(item.image_principale_url) || fallbackImg}
                alt={item.titre_fr}
                loading="lazy"
                decoding="async"
                onError={handleImageError}
                className="absolute inset-0 h-full w-full object-cover object-center select-none transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03]"
              />

              {/* Dégradé subtil pour la lisibilité du badge */}
              <div
                className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/10 pointer-events-none"
                aria-hidden="true"
              />

              {/* Badge superposé en bas de l'image (style AboutMission) */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 bg-black/85 backdrop-blur-md border border-white/25 rounded-xl px-4 py-3 text-white shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <span
                      className="h-2 w-2 rounded-full bg-brand-green shrink-0 mt-1 animate-pulse shadow-xs shadow-brand-green/80"
                      aria-hidden="true"
                    />
                    <div>
                      <h4 className="font-heading font-bold text-[0.72rem] sm:text-[0.78rem] uppercase tracking-wider text-white leading-tight">
                        {item.titre_fr}
                      </h4>
                      <p className="text-[0.6875rem] text-white/70 font-normal leading-normal mt-0.5">
                        Déploiement certifié et garanti FL Structures
                      </p>
                    </div>
                  </div>

                  {isOdd && (
                    <span className="self-start sm:self-center bg-brand-green/20 text-brand-green border border-brand-green/40 px-2.5 py-1 rounded-sm text-[0.65rem] font-bold font-heading whitespace-nowrap tracking-wider uppercase">
                      CERTIFIÉ B2B
                    </span>
                  )}
                </div>
              </div>
            </div>
          </figure>

          {/* Colonne Texte : order-2 sur mobile/tablette (toujours en dessous) */}
          <div
            className={`w-full flex flex-col justify-center order-2 ${
              reverse ? 'lg:order-2' : 'lg:order-1'
            }`}
          >
            {/* Pill Eyebrow identique à AboutMission */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200/90 bg-brand-cream/70 font-heading text-[0.625rem] font-bold uppercase tracking-[0.18em] text-brand-red mb-4 w-fit shadow-xs"
              style={animStyle(100)}
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0"
                aria-hidden="true"
              />
              <span>{overline}</span>
            </div>

            {/* H2 Titre principal identique à AboutMission */}
            <h2
              className="font-heading font-extrabold text-[1.5rem] sm:text-[1.75rem] lg:text-[1.875rem] text-brand-black text-balance leading-[1.2] tracking-tight mb-2"
              style={animStyle(180)}
            >
              {item.titre_fr}
            </h2>

            {/* Date harmonisée en majuscules espacées */}
            <p
              className="font-heading text-[0.6875rem] sm:text-[0.72rem] text-gray-400 uppercase tracking-[0.14em] font-semibold mb-6"
              style={animStyle(240)}
            >
              {dateText}
            </p>

            {/* 3 Blocs superposés : typographie et ombres douces de AboutMission */}
            <div className="flex flex-col gap-3.5">
              {blocks.map((block, idx) => {
                const blockDelay = 320 + idx * 100

                if (variant === 'border') {
                  return (
                    <div
                      key={block.tag}
                      style={animStyle(blockDelay)}
                      className={`bg-linear-to-r from-gray-50/95 to-white border-l-[3px] ${block.borderColor} border-y border-r border-gray-200/90 rounded-r-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300`}
                    >
                      <h3 className="font-heading font-bold text-[0.9375rem] text-brand-black mb-1.5 leading-snug">
                        {block.tag}
                      </h3>
                      <p className="text-gray-600 text-[0.8125rem] sm:text-[0.84375rem] leading-[1.65]">
                        {block.text}
                      </p>
                    </div>
                  )
                }

                // Variante 'white' (Cas 02) : blocs blancs sur fond crème
                return (
                  <div
                    key={block.tag}
                    style={animStyle(blockDelay)}
                    className="bg-white border border-gray-200/90 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${block.dotColor}`}
                        aria-hidden="true"
                      />
                      <h3 className="font-heading font-bold text-[0.75rem] sm:text-[0.8125rem] uppercase tracking-wider text-brand-black leading-snug">
                        {block.tag}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-[0.8125rem] sm:text-[0.84375rem] leading-[1.65]">
                      {block.text}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function CaseStudies() {
  const [prefersReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  const { data: realisationsData = [], isLoading } = useQuery({
    queryKey: ['realisations'],
    queryFn: () => getRealisations(),
    staleTime: 0,
  })

  const realisations = Array.isArray(realisationsData)
    ? realisationsData
    : (realisationsData?.data || [])

  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(realisations.length / ITEMS_PER_PAGE)
  const currentItems = realisations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div id="case-studies-container" className="flex flex-col w-full">
      {isLoading && realisations.length === 0 ? (
        <div className="py-24 text-center text-gray-500 font-heading text-sm">
          Chargement des réalisations...
        </div>
      ) : (
        currentItems.map((item, index) => (
          <CaseStudy
            key={item.id || index}
            item={item}
            index={index}
            currentPage={currentPage}
            prefersReduced={prefersReduced}
          />
        ))
      )}

      {/* Boutons de pagination sous la liste (uniquement si totalPages > 1) */}
      {totalPages > 1 && (
        <nav
          role="navigation"
          aria-label="Pagination des réalisations"
          className="py-12 md:py-16 flex justify-center items-center gap-2 bg-white border-b border-gray-100 select-none"
        >
          {/* Précédent */}
          <button
            type="button"
            onClick={() => {
              setCurrentPage((p) => Math.max(1, p - 1))
              const node = document.getElementById('case-studies-container')
              if (node) node.scrollIntoView({ behavior: 'smooth' })
            }}
            disabled={currentPage <= 1}
            aria-label="Page précédente"
            className="inline-flex items-center gap-1.5 px-4 h-11 rounded-xl border border-gray-200/90 bg-white text-xs font-heading font-bold uppercase tracking-wider text-brand-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Précédent</span>
          </button>

          {/* Numéros de page */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === currentPage
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => {
                    setCurrentPage(pageNum)
                    const node = document.getElementById('case-studies-container')
                    if (node) node.scrollIntoView({ behavior: 'smooth' })
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`min-w-[44px] h-11 px-3.5 rounded-xl font-heading font-bold text-xs transition-all shadow-xs cursor-pointer ${
                    isActive
                      ? 'bg-brand-red text-white shadow-sm'
                      : 'border border-gray-200/90 bg-white text-brand-black hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          {/* Suivant */}
          <button
            type="button"
            onClick={() => {
              setCurrentPage((p) => Math.min(totalPages, p + 1))
              const node = document.getElementById('case-studies-container')
              if (node) node.scrollIntoView({ behavior: 'smooth' })
            }}
            disabled={currentPage >= totalPages}
            aria-label="Page suivante"
            className="inline-flex items-center gap-1.5 px-4 h-11 rounded-xl border border-gray-200/90 bg-white text-xs font-heading font-bold uppercase tracking-wider text-brand-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
          >
            <span>Suivant</span>
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </div>
  )
}
