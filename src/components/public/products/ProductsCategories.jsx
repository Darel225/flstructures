import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getCategories } from '../../../services/api/category.service'
import { getProduits } from '../../../services/api/produit.service'
import { resolveImageUrl } from '../../../utils/imageResolver'
import { useDevisModal } from '../../../store/devisModalStore'
import CategoryProductsModal from './CategoryProductsModal'
import { getCategoryFallbackImage } from './categoryFallback'

import imgSecsFallback from '../../../assets/images/expertise-gamme1.jpg'
import imgFruitsFallback from '../../../assets/images/expertise-gamme.jpg'
import imgViandesFallback from '../../../assets/images/expertise-gamme.png'
import imgBoissonsFallback from '../../../assets/images/expertise-logistique.png'
import imgEntretienFallback from '../../../assets/images/expertise-logistique.jpg'
import imgSurMesureImage from '../../../assets/images/about-security.jpg'

const CATEGORIES_FALLBACK = [
  {
    id: 6,
    nom_fr: 'Produits Secs & Épicerie',
    badge: 'STOCK SÉCURISÉ',
    badgeVariant: 'default',
    description: 'Céréales, conserves, huiles et épicerie de base.',
    image: imgSecsFallback,
    actif: 1,
  },
  {
    id: 7,
    nom_fr: 'Fruits, Légumes & Produits Frais',
    badge: 'FRAIS & LOCAL',
    badgeVariant: 'green',
    description: 'Produits frais sous température contrôlée.',
    image: imgFruitsFallback,
    actif: 1,
  },
  {
    id: 8,
    nom_fr: 'Viandes, Volailles & Surgelés',
    badge: 'CHAÎNE DU FROID',
    badgeVariant: 'default',
    description: 'Protéines et surgelés stricts selon mercuriale.',
    image: imgViandesFallback,
    actif: 1,
  },
  {
    id: 9,
    nom_fr: 'Boissons & Consommables Alimentaires',
    badge: 'VOLUMES RÉGULIERS',
    badgeVariant: 'default',
    description: 'Eau minérale, jus et consommables quotidiens.',
    image: imgBoissonsFallback,
    actif: 1,
  },
  {
    id: 10,
    nom_fr: 'Produits d’Entretien & Hygiène',
    badge: 'NORMES HACCP',
    badgeVariant: 'default',
    description: 'Produits d’entretien et consommables connexes.',
    image: imgEntretienFallback,
    actif: 1,
  },
  {
    id: 11,
    nom_fr: 'Références Selon Mercuriale Client',
    badge: 'SUR MESURE',
    badgeVariant: 'red',
    description: 'Autres références selon vos besoins spécifiques.',
    image: imgSurMesureImage,
    actif: 1,
  },
]

const getCategoryDescription = (cat) => {
  if (cat.description_fr) return cat.description_fr
  if (cat.description) return cat.description
  const lower = (cat.nom_fr || '').toLowerCase()
  if (lower.includes('sec') || lower.includes('épicerie') || lower.includes('epicerie')) {
    return 'Céréales, conserves, huiles et épicerie de base.'
  }
  if (lower.includes('fruit') || lower.includes('légume') || lower.includes('legume') || lower.includes('frais')) {
    return 'Produits frais sous température contrôlée.'
  }
  if (lower.includes('viande') || lower.includes('volaille') || lower.includes('surgel')) {
    return 'Protéines et surgelés stricts selon mercuriale.'
  }
  if (lower.includes('boisson') || lower.includes('consommable')) {
    return 'Eau minérale, jus et consommables quotidiens.'
  }
  if (lower.includes('entretien') || lower.includes('hygiène') || lower.includes('hygiene')) {
    return 'Produits d’entretien et consommables connexes.'
  }
  if (lower.includes('mercuriale') || lower.includes('mesure')) {
    return 'Autres références selon vos besoins spécifiques.'
  }
  return 'Gamme professionnelle certifiée pour bases-vie et chantiers miniers.'
}

const getCategoryBadge = (cat) => {
  if (cat.badge) return { label: cat.badge, variant: cat.badgeVariant || 'default' }
  const lower = (cat.nom_fr || '').toLowerCase()
  if (lower.includes('fruit') || lower.includes('légume') || lower.includes('frais')) {
    return { label: 'FRAIS & LOCAL', variant: 'green' }
  }
  if (lower.includes('mercuriale') || lower.includes('mesure')) {
    return { label: 'SUR MESURE', variant: 'red' }
  }
  if (lower.includes('viande') || lower.includes('surgel')) {
    return { label: 'CHAÎNE DU FROID', variant: 'default' }
  }
  if (lower.includes('boisson')) {
    return { label: 'VOLUMES RÉGULIERS', variant: 'default' }
  }
  if (lower.includes('entretien') || lower.includes('hygiène')) {
    return { label: 'NORMES HACCP', variant: 'default' }
  }
  return { label: 'STOCK SÉCURISÉ', variant: 'default' }
}

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const STAGGER_MS = 140

function CategoryCard({ category, index, prefersReduced, isVisible, onSelectCategory }) {
  // Décalage séquentiel par carte (0ms, 140ms, 280ms, 420ms...)
  const delay = index * STAGGER_MS

  const badgeInfo = getCategoryBadge(category)
  const badgeClasses =
    badgeInfo.variant === 'green'
      ? 'bg-brand-green text-white shadow-xs'
      : badgeInfo.variant === 'red'
        ? 'bg-brand-red text-white shadow-xs'
        : 'bg-black/75 text-white backdrop-blur-xs border border-white/10 shadow-xs'

  const imgSrc =
    resolveImageUrl(category.image_url) || category.image || getCategoryFallbackImage(category)
  const description = getCategoryDescription(category)

  return (
    <li
      style={
        prefersReduced
          ? undefined
          : {
              opacity: isVisible ? 1 : 0,
              transform: isVisible
                ? 'translateY(0) scale(1)'
                : 'translateY(36px) scale(0.98)',
              filter: isVisible ? 'blur(0)' : 'blur(4px)',
              transition: `opacity 0.95s ${EASE} ${delay}ms, transform 1s ${EASE} ${delay}ms, filter 0.95s ${EASE} ${delay}ms`,
            }
      }
      className="list-none h-full will-change-transform"
    >
      <article
        onClick={() => onSelectCategory(category)}
        className="group relative flex flex-col h-full bg-[#F8F6F4] hover:bg-white border border-gray-200/80 hover:border-gray-300/90 rounded-xl overflow-hidden shadow-xs hover:shadow-[0_22px_45px_-15px_rgba(26,26,26,0.14)] transition-all duration-500 motion-safe:hover:-translate-y-2 cursor-pointer"
      >
        {/* Micro-filet d'accent supérieur discret au survol */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-0.5 bg-brand-red origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 z-20"
          style={{ transitionTimingFunction: EASE }}
        />

        {/* Cadre de l'image avec ratio fixe 4/3 et zoom lent cinématographique au survol */}
        <div className="relative overflow-hidden aspect-[4/3] bg-gray-100">
          <img
            src={imgSrc}
            alt={category.nom_fr || category.title || 'Catégorie d’approvisionnement'}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = getCategoryFallbackImage(category)
            }}
            className="w-full h-full object-cover transition-transform duration-700 ease-out select-none motion-safe:group-hover:scale-105"
          />

          {/* Voile très léger pour faire ressortir l'image au repos */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          />

          {/* Badge positionné en haut à gauche avec micro-élévation au survol */}
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-sm font-heading text-[0.625rem] sm:text-[0.6875rem] font-bold uppercase tracking-[0.14em] transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5 ${badgeClasses}`}
          >
            {badgeInfo.label}
          </span>
        </div>

        {/* Corps de la carte */}
        <div className="p-6 sm:p-7 flex flex-col flex-1">
          <h3 className="font-heading font-bold text-[1.125rem] sm:text-[1.25rem] text-brand-black mb-2 leading-snug transition-colors duration-300">
            {category.nom_fr || category.title}
          </h3>

          <p className="text-[0.84rem] sm:text-[0.875rem] text-gray-600 leading-[1.65] font-normal mb-6">
            {description}
          </p>

          {/* Zone du lien EXPLORER alignée en bas avec ligne tracée au survol */}
          <div className="mt-auto pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSelectCategory(category)
              }}
              aria-label={`Explorer : ${category.nom_fr || category.title}`}
              className="group/link font-heading font-bold text-[0.72rem] sm:text-[0.75rem] uppercase tracking-[0.16em] text-brand-red inline-flex items-center gap-2 transition-colors duration-200 group-hover:text-brand-red-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red cursor-pointer"
            >
              <span className="relative">
                EXPLORER
                {/* Petit filet sous le lien qui se trace au survol */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 -bottom-0.5 w-full h-[1.5px] bg-brand-red origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                />
              </span>
              <ArrowRight
                size={14}
                className="transition-transform duration-300 motion-safe:group-hover:translate-x-1.5 shrink-0"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </article>
    </li>
  )
}

export default function ProductsCategories() {
  const gridRef = useRef(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const { openModal: openDevisModal } = useDevisModal()

  const [prefersReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const [revealed, setRevealed] = useState(prefersReduced)

  // 1. Récupérer les catégories actives
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
    staleTime: 0,
  })
  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || [])

  // 2. Récupérer l'ensemble des produits
  const { data: produitsData = [] } = useQuery({
    queryKey: ['produits'],
    queryFn: () => getProduits(),
    staleTime: 0,
  })
  const produits = Array.isArray(produitsData) ? produitsData : (produitsData?.data || [])

  // Catégories actives triées par ordre d'affichage
  const rawList = categories.length > 0 ? categories : CATEGORIES_FALLBACK
  const activeCategories = rawList
    .filter((c) => c.actif === undefined || c.actif === null || Number(c.actif) === 1)
    .sort((a, b) => Number(a.ordre_affichage || 0) - Number(b.ordre_affichage || 0))

  useEffect(() => {
    if (prefersReduced) return

    const node = gridRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(node)

    const safetyTimer = setTimeout(() => {
      setRevealed(true)
    }, 1500)

    return () => {
      observer.disconnect()
      clearTimeout(safetyTimer)
    }
  }, [prefersReduced])

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de section centré */}
        <div className="flex flex-col items-center text-center mb-12 md:mb-14">
          {/* Pastille rouge avec point de chaque côté */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200/90 bg-white font-heading text-[0.625rem] font-bold uppercase tracking-[0.18em] text-brand-red mb-4 shadow-2xs">
            <span
              className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0"
              aria-hidden="true"
            />
            <span>GAMME B2B</span>
            <span
              className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0"
              aria-hidden="true"
            />
          </div>

          {/* H2 de la section */}
          <h2 className="font-heading font-extrabold text-[1.5rem] sm:text-[1.875rem] md:text-[2.25rem] text-brand-black tracking-tight leading-[1.18]">
            Nos Catégories d'Approvisionnement
          </h2>

          {/* Petit filet rouge court */}
          <div
            className="h-0.5 w-11 bg-brand-red mt-3.5 origin-center"
            aria-hidden="true"
          />
        </div>

        {/* Grille des catégories dynamiques */}
        <ul
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-0 m-0"
        >
          {activeCategories.map((cat, index) => (
            <CategoryCard
              key={cat.id || index}
              category={cat}
              index={index}
              prefersReduced={prefersReduced}
              isVisible={revealed}
              onSelectCategory={setSelectedCategory}
            />
          ))}
        </ul>
      </div>

      {/* Modal Immersif "Catalogue Produits de la Catégorie" */}
      {selectedCategory !== null && (
        <CategoryProductsModal
          category={selectedCategory}
          products={produits}
          onClose={() => setSelectedCategory(null)}
          openDevisModal={openDevisModal}
        />
      )}
    </section>
  )
}
