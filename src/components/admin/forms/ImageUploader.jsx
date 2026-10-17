import { useRef, useState } from 'react'
import {
  UploadIcon,
  ImageIcon,
  TrashIcon,
  RefreshIcon,
  AlertCircleIcon,
} from '../icons/AdminIcons'
import { resolveImageUrl } from '../../../utils/imageUrl'

/**
 * Composant de téléversement d'image unique (ImageUploader).
 * Sélection directe de fichier depuis l'ordinateur ou glisser-déposer.
 * Prévisualisation instantanée (0 ms) via URL.createObjectURL(file).
 *
 * @param {string} value - URL existante ou aperçu local
 * @param {File|null} file - Fichier binaire sélectionné
 * @param {Function} onChange - (file: File|null, previewUrl: string) => void
 * @param {string} label - Libellé du champ
 * @param {string} hint - Texte d'aide sous le libellé
 * @param {string} error - Message d'erreur éventuel
 * @param {string} aspectRatio - Ratio d'aspect de la zone
 * @param {boolean} required - Indique si le champ est obligatoire
 */
export default function ImageUploader({
  value = '',
  file = null,
  onChange,
  onFileChange,
  label = 'Visuel',
  hint = 'JPEG, PNG ou WebP · 5 Mo max',
  error,
  aspectRatio = 'aspect-[16/9]',
  required = false,
}) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState('')

  const currentPreview = value || (file ? URL.createObjectURL(file) : '')
  const resolvedDisplayUrl = resolveImageUrl(currentPreview)

  const handleSelectedFile = (selectedFile) => {
    if (!selectedFile) return
    setLocalError('')

    if (!selectedFile.type || !selectedFile.type.startsWith('image/')) {
      setLocalError('Format non accepté. Formats autorisés : JPEG, PNG ou WebP.')
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setLocalError('Image trop volumineuse. Taille maximale autorisée : 5 Mo.')
      return
    }

    try {
      const previewUrl = URL.createObjectURL(selectedFile)
      if (onChange) onChange(selectedFile, previewUrl)
      if (onFileChange) onFileChange(selectedFile, previewUrl)
    } catch {
      setLocalError('Impossible de générer la prévisualisation de l’image.')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleInputChange = (e) => {
    const selected = e.target.files?.[0]
    handleSelectedFile(selected)
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
    const dropped = e.dataTransfer.files?.[0]
    handleSelectedFile(dropped)
  }

  const handleRemove = () => {
    setLocalError('')
    if (onChange) onChange(null, '')
    if (onFileChange) onFileChange(null, '')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerSelect = () => {
    fileInputRef.current?.click()
  }

  const displayedError = error || localError

  return (
    <div className="space-y-2">
      {/* Libellé & Indication */}
      {label && (
        <div className="flex items-baseline justify-between">
          <label className="block text-[12.5px] font-semibold text-[#111111]">
            {label} {required && <span className="text-[#C0392B]">*</span>}
          </label>
          {hint && (
            <span className="text-[12px] text-[#777777]">
              {hint}
            </span>
          )}
        </div>
      )}

      {/* Input natif masqué mais accessible */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {resolvedDisplayUrl ? (
        /* APERÇU DE L'IMAGE AVEC ACTIONS SURVOL / BOUTONS */
        <div
          className={`relative w-full ${aspectRatio} rounded-2xl overflow-hidden border border-[#E8E4DF] bg-[#FAF8F6] group shadow-2xs`}
        >
          <img
            src={resolvedDisplayUrl}
            alt="Aperçu du visuel"
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-101"
            onError={(e) => {
              e.currentTarget.src =
                'https://placehold.co/800x600/f8f6f4/111111?text=Image+Indisponible'
            }}
          />

          {/* Voile d'actions sobre */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
            <button
              type="button"
              onClick={triggerSelect}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white text-[#111111] text-[12.5px] font-medium shadow-xs hover:bg-[#F8F6F4] hover:text-[#C0392B] transition-colors cursor-pointer"
            >
              <RefreshIcon size={14} />
              <span>Remplacer</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white text-[12.5px] font-medium shadow-xs transition-colors cursor-pointer"
            >
              <TrashIcon size={14} />
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      ) : (
        /* ZONE DE GLISSER-DÉPOSER / SÉLECTION */
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
          aria-label={`${label} : Cliquez ou glissez-déposez une image`}
          className={`relative w-full ${aspectRatio} rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 focus:border-[#C0392B] ${
            isDragging
              ? 'border-[#C0392B] bg-[#C0392B]/5 text-[#C0392B]'
              : 'border-[#E8E4DF] hover:border-[#C0392B]/60 bg-[#FAF8F6] text-[#555555]'
          }`}
        >
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-white border border-[#E8E4DF] flex items-center justify-center text-[#777777] shadow-2xs">
              {isDragging ? <UploadIcon size={20} className="text-[#C0392B]" /> : <ImageIcon size={20} />}
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-[#111111]">
                <span className="text-[#C0392B]">Cliquez pour choisir</span> ou glissez une image ici
              </p>
              <p className="text-[12px] text-[#777777] mt-0.5">
                JPEG, PNG ou WebP (max 5 Mo)
              </p>
            </div>
          </div>
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
