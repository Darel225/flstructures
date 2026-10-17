import { useEffect } from 'react'
import { X, Package } from 'lucide-react'
import { resolveImageUrl } from '../../../utils/imageResolver'
import { getCategoryFallbackImage } from './categoryFallback'

export default function CategoryProductsModal({
  category,
  products = [],
  onClose,
  openDevisModal,
}) {
  // Fermeture sur touche Échap et blocage du défilement d'arrière-plan
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!category) return null

  // Filtrage des produits réels rattachés à cette catégorie
  const categoryProducts = products.filter(
    (p) => Number(p.categorie_id) === Number(category.id)
  )

  const bannerImgSrc =
    resolveImageUrl(category.image_url) || getCategoryFallbackImage(category)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Catalogue ${category.nom_fr}`}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête de la Catégorie (Bannière visuelle ~160px) */}
        <div className="relative h-44 sm:h-48 w-full shrink-0 overflow-hidden bg-neutral-900">
          <img
            src={bannerImgSrc}
            alt={category.nom_fr || 'Bannière de catégorie'}
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = getCategoryFallbackImage(category)
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Dégradé noir subtil pour contraste parfait */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

          {/* Bouton Fermer (X) en haut à droite avec fond rond blanc/transparent */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le catalogue"
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Informations textuelles de l'en-tête */}
          <div className="relative z-10 p-6 flex flex-col justify-end h-full">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider bg-brand-red text-white w-fit shadow-xs mb-1.5">
              CATÉGORIE RÉFÉRENCÉE FL STRUCTURES
            </span>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-heading font-extrabold text-white leading-tight">
              {category.nom_fr}
            </h3>

            <p className="text-xs text-white/80 font-medium mt-1">
              {categoryProducts.length} référence{categoryProducts.length > 1 ? 's' : ''} disponible{categoryProducts.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Corps du Modal (Zone défilable avec liste des produits) */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryProducts.map((p) => {
                const productImg =
                  resolveImageUrl(p.image_url) || getCategoryFallbackImage(category)

                return (
                  <div
                    key={p.id}
                    className="flex gap-4 p-4 rounded-2xl border border-neutral-100 bg-[#FBFBFB] hover:bg-white hover:border-neutral-200 hover:shadow-sm transition-all duration-200"
                  >
                    {/* Vignette carrée de l'image réelle (~80x80px) */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-neutral-100 border border-neutral-200/70">
                      <img
                        src={productImg}
                        alt={p.nom_fr}
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = getCategoryFallbackImage(category)
                        }}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Détails du produit */}
                    <div className="flex flex-col flex-1 min-w-0 justify-between">
                      <div>
                        <h4 className="font-heading font-bold text-sm text-neutral-900 leading-snug line-clamp-1">
                          {p.nom_fr}
                        </h4>

                        {p.description_courte_fr && (
                          <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                            {p.description_courte_fr}
                          </p>
                        )}

                        <div className="mt-2">
                          <span className="inline-flex items-center text-[10px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                            Stock base-vie & chantiers
                          </span>
                        </div>
                      </div>

                      {/* Bouton d'action directe */}
                      <button
                        type="button"
                        onClick={() => {
                          onClose?.()
                          openDevisModal?.({
                            defaultNeed: `Approvisionnement : ${p.nom_fr} (${category.nom_fr})`,
                          })
                        }}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 mt-2.5 cursor-pointer w-fit transition-colors"
                      >
                        Demander une cotation ➔
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* État soigné si aucun produit n'est directement rattaché */
            <div className="py-12 px-6 flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-red-50 text-brand-red flex items-center justify-center mb-3">
                <Package size={24} />
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                Cette catégorie fait l'objet d'approvisionnements sur mercuriale personnalisée. Contactez notre équipe pour commander ce type de denrées ou matériels.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose?.()
                  openDevisModal?.({
                    defaultNeed: `Approvisionnement sur mercuriale : ${category.nom_fr}`,
                  })
                }}
                className="mt-4 px-4 py-2.5 rounded-xl bg-brand-red text-white text-xs font-heading font-bold uppercase tracking-wider hover:bg-brand-red-dark transition-all shadow-xs cursor-pointer"
              >
                Demander une cotation pour cette catégorie ➔
              </button>
            </div>
          )}
        </div>

        {/* Pied du Modal */}
        <div className="p-4 sm:p-5 border-t border-neutral-100 bg-neutral-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-neutral-200 text-xs font-heading font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer text-center"
          >
            Fermer
          </button>

          <button
            type="button"
            onClick={() => {
              onClose?.()
              openDevisModal?.({
                defaultNeed: `Approvisionnement global catégorie : ${category.nom_fr}`,
              })
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-red text-white text-xs font-heading font-bold uppercase tracking-wider hover:bg-brand-red-dark transition-colors shadow-sm cursor-pointer text-center"
          >
            Demander un devis pour toute la catégorie ➔
          </button>
        </div>
      </div>
    </div>
  )
}
