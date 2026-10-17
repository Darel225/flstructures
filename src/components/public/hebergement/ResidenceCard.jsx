import { useState } from 'react'
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { resolveImageUrl } from '../../../utils/imageResolver'

export default function ResidenceCard({ residence, onOpenDetail, onBookNow }) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)

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
    photos = ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80']
  }

  const currentPhoto = photos[activePhotoIdx] || photos[0]
  const equipements = Array.isArray(residence.equipements) ? residence.equipements : []
  const residenceNom = residence.nom || residence.nom_residence || residence.title || 'Résidence de Prestige'
  const residenceLoc = residence.localisation || 'Abidjan, Côte d’Ivoire'
  const residenceDesc =
    residence.description ||
    residence.description_fr ||
    "Appartement d'affaires sécurisé tout équipé avec prestations de conciergerie."
  const servicesCount = equipements.length > 0 ? equipements.length : residence.equipements_count || 3

  const nextPhoto = (e) => {
    e.stopPropagation()
    setActivePhotoIdx((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = (e) => {
    e.stopPropagation()
    setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <div
      onClick={() => onOpenDetail?.(residence)}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-100 flex flex-col cursor-pointer"
    >
      {/* Zone Image avec Badges & Mini-Carousel */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-neutral-900">
        <img
          src={resolveImageUrl(currentPhoto)}
          alt={residenceNom}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
          }}
        />

        {/* Badges Flottants */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900/80 text-white backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            DISPONIBLE
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/90 text-white backdrop-blur-md">
            STANDING B2B
          </span>
        </div>

        {/* Flèches de navigation mini-carousel (apparaissent au survol) */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
              title="Photo précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
              title="Photo suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Pastilles d'indication */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activePhotoIdx ? 'bg-white w-3' : 'bg-white/50 w-1.5'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Contenu de la Carte */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-neutral-900 font-display group-hover:text-primary transition-colors">
            {residenceNom}
          </h3>

          <div className="flex items-center text-xs text-neutral-500 gap-1">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{residenceLoc}</span>
          </div>

          {/* Grille 3 blocs caractéristiques */}
          <div className="grid grid-cols-3 gap-2 py-2 border-y border-neutral-100 text-center">
            <div className="p-1.5 bg-neutral-50 rounded-xl">
              <div className="text-[10px] text-neutral-400">Pièces</div>
              <div className="text-xs font-bold text-neutral-800">
                {residence.nombre_pieces || 1} pcs
              </div>
            </div>
            <div className="p-1.5 bg-neutral-50 rounded-xl">
              <div className="text-[10px] text-neutral-400">Capacité</div>
              <div className="text-xs font-bold text-neutral-800">
                {residence.capacite_accueil || 2} pers.
              </div>
            </div>
            <div className="p-1.5 bg-neutral-50 rounded-xl">
              <div className="text-[10px] text-neutral-400">Services</div>
              <div className="text-xs font-bold text-primary">{servicesCount} inclus</div>
            </div>
          </div>

          {/* Extrait description */}
          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
            {residenceDesc}
          </p>
        </div>

        {/* Bouton Vérifier les Disponibilités */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onBookNow?.(residence)
          }}
          className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 cursor-pointer"
        >
          <span>VÉRIFIER LES DISPONIBILITÉS</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
