import { useState } from 'react'
import {
  ImageIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
  CheckCircleIcon,
} from '../icons/AdminIcons'

// Suggestions de visuels B2B réalistes pour la démo rapide
const PRESET_SUGGESTIONS = [
  {
    label: 'Base-Vie Modulaire',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Shelter Isotherme',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Chambre VIP Cadre',
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Réfectoire & Cantine',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Hangar Industriel',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
  },
]

/**
 * Composant réutilisable pour la gestion d'une galerie d'images avec photo de couverture.
 * @param {{
 *   value?: Array<{ image_url: string, is_cover: boolean }>,
 *   onChange: (images: Array<{ image_url: string, is_cover: boolean }>) => void,
 *   error?: string,
 *   label?: string,
 *   hint?: string
 * }} props
 */
export default function GalleryManager({
  value = [],
  onChange,
  error,
  label = 'Galerie d’images & Visuels',
  hint = 'Définissez une image principale de couverture pour les catalogues et fiches publiques.',
}) {
  const [inputUrl, setInputUrl] = useState('')
  const [inputError, setInputError] = useState('')

  // Ajout d'une nouvelle URL à la galerie
  const handleAddImage = (urlToAdd) => {
    const targetUrl = (urlToAdd || inputUrl).trim()
    if (!targetUrl) return

    try {
      new URL(targetUrl)
    } catch {
      setInputError('Veuillez saisir une URL valide (commençant par http:// ou https://)')
      return
    }

    if (value.some((img) => img.image_url === targetUrl)) {
      setInputError('Cette image figure déjà dans la collection.')
      return
    }

    const isFirst = value.length === 0
    const updated = [...value, { image_url: targetUrl, is_cover: isFirst }]
    onChange(updated)
    setInputUrl('')
    setInputError('')
  }

  // Suppression d'une image par son index
  const handleRemoveImage = (indexToRemove) => {
    const wasCover = value[indexToRemove]?.is_cover
    const updated = value.filter((_, i) => i !== indexToRemove)

    if (wasCover && updated.length > 0) {
      updated[0].is_cover = true
    }

    onChange(updated)
  }

  // Bascule du statut de couverture principale
  const handleSetCover = (indexToCover) => {
    const updated = value.map((item, index) => ({
      ...item,
      is_cover: index === indexToCover,
    }))
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      {/* En-tête du composant */}
      <div className="flex items-center justify-between">
        <div>
          <label className="fl-admin-label text-[#111111]">
            {label}
          </label>
          {hint && (
            <p className="text-xs text-[#777777] mt-0.5">
              {hint}
            </p>
          )}
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#F8F6F4] text-[#111111] border border-[#E8E4DF] tabular-nums">
          {value.length} {value.length > 1 ? 'photos' : 'photo'}
        </span>
      </div>

      {/* Barre d'ajout rapide d'URL */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <ImageIcon
            size={16}
            className="absolute left-3 top-3.5 text-[#777777]"
          />
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => {
              setInputUrl(e.target.value)
              if (inputError) setInputError('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddImage()
              }
            }}
            placeholder="https://domaine.com/images/vue-aerienne.jpg"
            className="w-full pl-9 pr-3 h-11 text-xs bg-white border border-[#E8E4DF] rounded-xl text-[#111111] placeholder-[#777777] focus:outline-none focus:ring-2 focus:ring-[#C0392B]/20 focus:border-[#C0392B] transition-all"
          />
        </div>
        <button
          type="button"
          onClick={() => handleAddImage()}
          className="inline-flex items-center justify-center gap-1.5 px-4 h-11 bg-[#C0392B] hover:bg-[#A93226] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <PlusIcon size={14} />
          Ajouter à la galerie
        </button>
      </div>

      {/* Erreur de saisie locale */}
      {inputError && (
        <p className="text-xs text-[#C0392B] font-medium">
          {inputError}
        </p>
      )}

      {/* Suggestions rapides B2B */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-[0.6875rem] font-medium text-[#777777] inline-flex items-center gap-1">
          Suggestions :
        </span>
        {PRESET_SUGGESTIONS.map((preset) => {
          const alreadyAdded = value.some((img) => img.image_url === preset.url)
          return (
            <button
              key={preset.label}
              type="button"
              disabled={alreadyAdded}
              onClick={() => handleAddImage(preset.url)}
              className={`text-[0.6875rem] px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                alreadyAdded
                  ? 'bg-[#F8F6F4] text-[#777777] border-transparent cursor-not-allowed line-through'
                  : 'bg-white text-[#111111] border-[#E8E4DF] hover:border-[#C0392B] hover:text-[#C0392B]'
              }`}
            >
              + {preset.label}
            </button>
          )
        })}
      </div>

      {/* Grille de vignettes */}
      {value.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#E8E4DF] rounded-xl bg-[#FAF8F6] text-center">
          <ImageIcon size={28} className="text-[#777777] mb-2" />
          <p className="text-xs font-semibold text-[#111111]">
            Aucune image dans la galerie
          </p>
          <p className="text-[0.6875rem] text-[#777777] max-w-xs mt-0.5">
            Saisissez l’URL d’un cliché ou cliquez sur l’une des suggestions ci-dessus.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {value.map((item, index) => {
            const isCover = item.is_cover

            return (
              <div
                key={item.image_url}
                className={`group relative rounded-xl overflow-hidden border transition-all ${
                  isCover
                    ? 'border-[#C0392B] ring-2 ring-[#C0392B]/20 shadow-xs'
                    : 'border-[#E8E4DF] hover:border-[#777777]'
                }`}
              >
                {/* Image */}
                <div className="aspect-video bg-[#F8F6F4] overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={`Photo galerie ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://placehold.co/600x400/27272a/fafafa?text=Photo+Introuvable'
                    }}
                  />
                </div>

                {/* Badge Couverture si actif */}
                {isCover && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C0392B] text-white text-[0.625rem] font-bold shadow-xs">
                    <StarIcon size={10} className="fill-current" />
                    Couverture
                  </div>
                )}

                {/* Voile d'actions en survol / boutons rapides */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  {!isCover && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(index)}
                      title="Définir comme photo principale"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/95 text-[#111111] text-[0.6875rem] font-semibold hover:bg-white hover:text-[#C0392B] transition-colors shadow-xs cursor-pointer"
                    >
                      <StarIcon size={11} />
                      Couverture
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    title="Supprimer cette photo"
                    className="p-1.5 rounded-lg bg-[#C0392B] text-white hover:bg-[#A93226] transition-colors shadow-xs cursor-pointer"
                  >
                    <TrashIcon size={13} />
                  </button>
                </div>

                {/* Statut au bas de la carte */}
                <div className="p-1.5 bg-white flex items-center justify-between text-[0.625rem] text-[#777777]">
                  <span className="truncate max-w-[100px] font-mono tabular-nums">
                    #{index + 1}
                  </span>
                  {isCover ? (
                    <span className="text-[#C0392B] font-semibold flex items-center gap-0.5">
                      <CheckCircleIcon size={10} /> Principale
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetCover(index)}
                      className="text-[#777777] hover:text-[#C0392B] transition-colors cursor-pointer"
                    >
                      Définir couverture
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Erreur de validation générale du formulaire */}
      {error && (
        <p className="text-xs text-[#C0392B] font-medium">
          {error}
        </p>
      )}
    </div>
  )
}
