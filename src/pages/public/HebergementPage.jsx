import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPublicHebergements } from '../../services/hebergementService'
import ResidenceCard from '../../components/public/hebergement/ResidenceCard'
import ResidenceDetailModal from '../../components/public/hebergement/ResidenceDetailModal'
import { useHebergementModal } from '../../context/HebergementModalContext'

export default function HebergementPage() {
  const [selectedResidence, setSelectedResidence] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 6 // 2 lignes de 3 résidences

  // Hook du modal de réservation
  const { openModal } = useHebergementModal?.() || {}

  const { data: hebergementsData = [], isLoading } = useQuery({
    queryKey: ['public-hebergements'],
    queryFn: getPublicHebergements,
    staleTime: 0,
  })

  const residences = Array.isArray(hebergementsData)
    ? hebergementsData
    : hebergementsData?.data || []

  const totalPages = Math.ceil(residences.length / ITEMS_PER_PAGE)
  const paginatedResidences = residences.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePageChange = (page) => {
    setCurrentPage(page)
    // Remontée fluide vers le haut de la grille
    const section = document.getElementById('residences-grid-section')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 300, behavior: 'smooth' })
    }
  }

  const handleOpenDetail = (residence) => {
    setSelectedResidence(residence)
    setIsDetailModalOpen(true)
  }

  const handleBookNow = (residence) => {
    const residenceName = residence?.nom || residence?.nom_residence || residence?.title || ''
    if (openModal) {
      openModal({ defaultResidence: residenceName, residence: residenceName })
    } else {
      window.dispatchEvent(new CustomEvent('open-hebergement-booking', { detail: { residence } }))
    }
  }

  return (
    <div id="residences-grid-section" className="py-16 bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Titre & Sous-titre */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-900 mb-3">
            Découvrez nos appartements corporate
          </h1>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-4" />
          <p className="text-neutral-500 max-w-2xl mx-auto text-sm md:text-base">
            Solutions d'hébergements de prestige et bases-vie entièrement équipées pour cadres miniers, directeurs de mission et délégations B2B.
          </p>
        </div>

        {/* Grille des Résidences */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl h-96 animate-pulse border border-neutral-100"
              />
            ))}
          </div>
        ) : residences.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500">Aucune résidence disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedResidences.map((residence) => (
              <ResidenceCard
                key={residence.id}
                residence={residence}
                onOpenDetail={handleOpenDetail}
                onBookNow={handleBookNow}
              />
            ))}
          </div>
        )}

        {/* Barre de pagination (visible uniquement si totalPages > 1) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-neutral-200">
            {/* Précédent */}
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                currentPage === 1
                  ? 'text-neutral-300 cursor-not-allowed bg-neutral-100'
                  : 'text-neutral-700 hover:bg-neutral-200 bg-white border border-neutral-200 shadow-sm'
              }`}
            >
              ‹ Précédent
            </button>

            {/* Numéros de page */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                type="button"
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Suivant */}
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                currentPage === totalPages
                  ? 'text-neutral-300 cursor-not-allowed bg-neutral-100'
                  : 'text-neutral-700 hover:bg-neutral-200 bg-white border border-neutral-200 shadow-sm'
              }`}
            >
              Suivant ›
            </button>
          </div>
        )}
      </div>

      {/* Modal Détails & Galerie */}
      <ResidenceDetailModal
        key={selectedResidence?.id || 'none'}
        residence={selectedResidence}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onBookNow={handleBookNow}
      />
    </div>
  )
}
