import { useState, useEffect } from 'react'
import {
  X,
  MapPin,
  Users,
  BedDouble,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ShieldCheck,
  Wifi,
  Wind,
  Zap,
  Tv,
  Coffee,
  Utensils,
  Sparkles,
} from 'lucide-react'
import { resolveImageUrl } from '../../../utils/imageResolver'

// Dictionnaire des icônes dynamiques
const ICON_MAP = {
  wifi: Wifi,
  wind: Wind,
  zap: Zap,
  tv: Tv,
  coffee: Coffee,
  utensils: Utensils,
  sparkles: Sparkles,
  shield: ShieldCheck,
}

export default function ResidenceDetailModal({ residence, isOpen, onClose, onBookNow }) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  // Verrouillage du défilement d'arrière-plan
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Fermeture avec la touche Échap
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !residence) return null

  // Préparation du tableau des photos
  let photos = []
  if (Array.isArray(residence.photos) && residence.photos.length > 0) {
    photos = residence.photos.map((p) => (typeof p === 'string' ? p : p?.image_url || ''))
  } else if (Array.isArray(residence.images) && residence.images.length > 0) {
    photos = residence.images.map((p) => (typeof p === 'string' ? p : p?.image_url || ''))
  } else if (typeof residence.photos === 'string' && residence.photos.startsWith('[')) {
    try {
      photos = JSON.parse(residence.photos)
    } catch {
      photos = []
    }
  } else if (residence.image_url) {
    photos = [residence.image_url]
  } else if (residence.photo_principale) {
    photos = [residence.photo_principale]
  } else if (residence.cover_image_url) {
    photos = [residence.cover_image_url]
  }

  photos = photos.filter(Boolean)

  if (photos.length === 0) {
    photos = ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80']
  }

  const activePhoto = photos[selectedPhotoIndex] || photos[0]
  const equipements = Array.isArray(residence.equipements) ? residence.equipements : []
  const residenceNom = residence.nom || residence.nom_residence || residence.title || 'Résidence de Prestige'
  const residenceDesc =
    residence.description ||
    residence.description_fr ||
    "Hébergement d'affaires haute sécurité avec services hôteliers et prestations clé en main."
  const residenceLoc = residence.localisation || 'Abidjan, Côte d’Ivoire'

  const handleNextPhoto = (e) => {
    e.stopPropagation()
    setSelectedPhotoIndex((prev) => (prev + 1) % photos.length)
  }

  const handlePrevPhoto = (e) => {
    e.stopPropagation()
    setSelectedPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop sombre flouté */}
      <div
        className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Conteneur Modal */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 my-auto transform transition-all border border-neutral-100 flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              DISPONIBLE
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              STANDING B2B
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200/60 rounded-full transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps du modal défilable */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Colonne Gauche : Galerie Photo (7 cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              {/* Grande Photo Principale */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-neutral-900 group shadow-md">
                <img
                  src={resolveImageUrl(activePhoto)}
                  alt={residenceNom}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
                  }}
                />
                {/* Flèches de navigation dans la grande photo */}
                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevPhoto}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all cursor-pointer"
                      title="Photo précédente"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextPhoto}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all cursor-pointer"
                      title="Photo suivante"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 text-white text-xs backdrop-blur-sm">
                      {selectedPhotoIndex + 1} / {photos.length}
                    </div>
                  </>
                )}
              </div>

              {/* Ruban des miniatures */}
              {photos.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                  {photos.map((photo, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        selectedPhotoIndex === idx
                          ? 'border-primary ring-2 ring-primary/20 scale-95'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={resolveImageUrl(photo)}
                        alt={`Miniature ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Colonne Droite : Métadonnées & Équipements (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 font-display">
                    {residenceNom}
                  </h3>
                  <div className="flex items-center text-sm text-neutral-500 mt-1 gap-1.5">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span>{residenceLoc}</span>
                  </div>
                </div>

                {/* Badges Capacité & Pièces */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-neutral-100">
                  <div className="flex items-center gap-2.5 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                    <BedDouble className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-xs text-neutral-500">Disposition</div>
                      <div className="text-sm font-semibold text-neutral-800">
                        {residence.nombre_pieces || 1} pièces
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-xs text-neutral-500">Capacité</div>
                      <div className="text-sm font-semibold text-neutral-800">
                        {residence.capacite_accueil || 2} personnes
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Complète */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-neutral-600 leading-relaxed max-h-36 overflow-y-auto pr-1">
                    {residenceDesc}
                  </p>
                </div>

                {/* Équipements & Commodités Inclus */}
                {equipements.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                      Équipements & Prestations inclus
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {equipements.map((eq, i) => {
                        const iconKey = (eq.icone || eq.icon_name || '')?.toLowerCase()
                        const IconComponent = ICON_MAP[iconKey] || CheckCircle2
                        const eqNom = eq.nom || eq.nom_fr || 'Équipement inclus'
                        return (
                          <span
                            key={eq.id || i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-50 text-neutral-700 border border-neutral-200/70"
                          >
                            <IconComponent className="w-3.5 h-3.5 text-primary" />
                            {eqNom}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton de Réservation Directe */}
              <div className="pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    onClose?.()
                    onBookNow?.(residence)
                  }}
                  className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>VÉRIFIER LES DISPONIBILITÉS</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
