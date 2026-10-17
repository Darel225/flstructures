import { useRef, useState } from 'react'
import {
  UploadIcon,
  ImageIcon,
  StarIcon,
  TrashIcon,
  AlertCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
} from '../icons/AdminIcons'
import { resolveImageUrl, handleImageError } from '../../../utils/imageUrl'

/**
 * Composant de téléversement et gestion d'une galerie d'images multiples.
 * Sélection multiple par lot (clic ou drag & drop), définition de la couverture principale (étoile),
 * suppression, réordonnancement simple et validation de format.
 */
export default function GalleryUploader({
  value = [],
  onChange,
  onFilesChange,
  onDeleteImage,
  onSetCover,
  error,
  label = 'Galerie d’images & Visuels',
  hint = 'Ajoutez au moins une photo. Cliquez sur l’étoile pour désigner la couverture principale.',
}) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState('')

  // Traitement instantané d'une liste de fichiers (multi-select) via URL.createObjectURL
  const handleFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return
    setLocalError('')

    const newUploaded = []
    const errors = []

    for (const file of Array.from(fileList)) {
      if (!file.type || !file.type.startsWith('image/')) {
        errors.push(`${file.name}: Seules les images (JPEG, PNG, WebP) sont acceptées.`)
        continue
      }
      try {
        const previewUrl = URL.createObjectURL(file)
        newUploaded.push({ url: previewUrl, file })
      } catch (err) {
        errors.push(`${file.name}: ${err?.message || 'Erreur lors de la prévisualisation.'}`)
      }
    }

    if (errors.length > 0) {
      setLocalError(errors.join(' | '))
    }

    if (newUploaded.length > 0) {
      const hasCover = value.some((img) => img.is_cover)
      const formatted = newUploaded.map((item, idx) => ({
        image_url: item.url,
        is_cover: !hasCover && idx === 0,
        file: item.file,
      }))

      const nextValue = [...value, ...formatted]
      onChange(nextValue)
      if (onFilesChange) {
        onFilesChange(nextValue.map((img) => img.file).filter(Boolean))
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleInputChange = (e) => {
    handleFiles(e.target.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  // Définir une image comme couverture principale unique
  const handleSetCover = (index) => {
    const target = value[index]
    const updated = value.map((img, i) => ({
      ...img,
      is_cover: i === index,
    }))
    onChange(updated)
    if (onSetCover && target) {
      onSetCover(target)
    }
  }

  // Supprimer une image de la galerie
  const handleRemove = (index) => {
    const target = value[index]
    const wasCover = target?.is_cover
    const updated = value.filter((_, i) => i !== index)

    if (wasCover && updated.length > 0) {
      updated[0].is_cover = true
    }

    onChange(updated)
    if (onFilesChange) {
      onFilesChange(updated.map((img) => img.file).filter(Boolean))
    }
    if (onDeleteImage && target) {
      onDeleteImage(target)
    }
  }

  // Réordonnancement simple : déplacer vers la gauche
  const handleMoveLeft = (index) => {
    if (index <= 0) return
    const updated = [...value]
    const temp = updated[index - 1]
    updated[index - 1] = updated[index]
    updated[index] = temp
    onChange(updated)
    if (onFilesChange) {
      onFilesChange(updated.map((img) => img.file).filter(Boolean))
    }
  }

  // Réordonnancement simple : déplacer vers la droite
  const handleMoveRight = (index) => {
    if (index >= value.length - 1) return
    const updated = [...value]
    const temp = updated[index + 1]
    updated[index + 1] = updated[index]
    updated[index] = temp
    onChange(updated)
    if (onFilesChange) {
      onFilesChange(updated.map((img) => img.file).filter(Boolean))
    }
  }

  const triggerSelect = () => {
    fileInputRef.current?.click()
  }

  const displayedError = error || localError

  return (
    <div className="space-y-3">
      {/* En-tête avec compteur */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-[12.5px] font-semibold text-[#111111]">
            {label}
          </label>
          {hint && (
            <p className="text-[12px] text-[#777777] mt-0.5">
              {hint}
            </p>
          )}
        </div>
        <span className="text-[12px] tabular-nums font-semibold px-2 py-0.5 rounded-lg bg-[#FAF8F6] border border-[#E8E4DF] text-[#111111]">
          {value.length} {value.length > 1 ? 'photos' : 'photo'}
        </span>
      </div>

      {/* Input natif multiple masqué */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={handleInputChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Zone de téléversement (Glisser-Déposer ou Clic) */}
      <div
        role="button"
        tabIndex={0}
        onClick={triggerSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            triggerSelect()
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-label="Zone de téléversement de la galerie : Cliquez ou déposez vos images"
        className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 focus:border-[#C0392B] ${
          isDragging
            ? 'border-[#C0392B] bg-[#C0392B]/5 text-[#C0392B]'
            : 'border-[#E8E4DF] hover:border-[#C0392B]/60 bg-[#FAF8F6] text-[#555555]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-[#E8E4DF] flex items-center justify-center text-[#777777] shadow-2xs shrink-0">
            {isDragging ? <UploadIcon size={18} className="text-[#C0392B]" /> : <ImageIcon size={18} />}
          </div>
          <div className="text-left">
            <p className="text-[13px] font-semibold text-[#111111]">
              <span className="text-[#C0392B]">Ajouter des photos</span> (sélection multiple par lot)
            </p>
            <p className="text-[12px] text-[#777777]">
              Glissez vos fichiers ou cliquez pour parcourir vos dossiers
            </p>
          </div>
        </div>
      </div>

      {/* Grille de vignettes */}
      {value.length === 0 ? (
        <div className="p-5 border border-[#E8E4DF] rounded-2xl bg-white text-center">
          <p className="text-[13px] text-[#777777]">
            Aucun visuel enregistré dans cette galerie.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {value.map((item, index) => {
            const isCover = item.is_cover

            return (
              <div
                key={item.id ? `img-${item.id}` : `${item.image_url || 'img'}-${index}`}
                className={`group relative rounded-2xl overflow-hidden border transition-all ${
                  isCover
                    ? 'border-[#C0392B] ring-2 ring-[#C0392B]/20 shadow-xs'
                    : 'border-[#E8E4DF] hover:border-[#C0392B]/40 bg-white'
                }`}
              >
                {/* Image */}
                <div className="aspect-video bg-[#FAF8F6] overflow-hidden">
                  <img
                    src={resolveImageUrl(item.image_url)}
                    alt={`Photo galerie ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-200"
                    onError={(e) => {
                      handleImageError(e)

                    }}
                  />
                </div>

                {/* Badge Couverture */}
                {isCover && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C0392B] text-white text-[11px] font-bold shadow-xs">
                    <StarIcon size={11} className="fill-current" />
                    Couverture
                  </div>
                )}

                {/* Voile d'actions au survol */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                  {!isCover && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(index)}
                      title="Définir comme photo de couverture"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-[#111111] text-[12px] font-semibold hover:bg-[#F8F6F4] hover:text-[#C0392B] transition-colors shadow-xs cursor-pointer"
                    >
                      <StarIcon size={12} />
                      Couverture
                    </button>
                  )}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveLeft(index)}
                      title="Déplacer vers la gauche"
                      className="p-1 rounded-lg bg-white text-[#111111] hover:bg-[#F8F6F4] transition-colors cursor-pointer"
                    >
                      <ChevronLeftIcon size={14} />
                    </button>
                  )}
                  {index < value.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveRight(index)}
                      title="Déplacer vers la droite"
                      className="p-1 rounded-lg bg-white text-[#111111] hover:bg-[#F8F6F4] transition-colors cursor-pointer"
                    >
                      <ChevronRightIcon size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    title="Supprimer cette photo"
                    className="p-1.5 rounded-lg bg-[#C0392B] text-white hover:bg-[#A93226] transition-colors shadow-xs cursor-pointer"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>

                {/* Pied de vignette */}
                <div className="p-2 bg-white flex items-center justify-between text-[11.5px] text-[#777777] border-t border-[#E8E4DF]">
                  <span className="tabular-nums font-medium">#{index + 1}</span>
                  {isCover ? (
                    <span className="text-[#C0392B] font-semibold flex items-center gap-1">
                      <CheckIcon size={12} /> Principale
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

      {/* Message d'erreur */}
      {displayedError && (
        <div className="flex items-center gap-1.5 text-[12px] text-[#C0392B] font-medium">
          <AlertCircleIcon size={13} className="shrink-0" />
          <span>{displayedError}</span>
        </div>
      )}
    </div>
  )
}
