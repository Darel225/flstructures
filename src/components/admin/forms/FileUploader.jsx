import { useRef, useState } from 'react'
import {
  PdfIcon,
  UploadIcon,
  DownloadIcon,
  ExternalLinkIcon,
  RefreshIcon,
  TrashIcon,
  AlertCircleIcon,
  LoaderIcon,
} from '../icons/AdminIcons'
import { uploadFile } from '../../../services/uploadService'

/**
 * Formate une taille en octets en format lisible (Ko, Mo).
 */
function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`
}

/**
 * Composant de téléversement de fichier document (PDF).
 * Affiche une carte complète du fichier après sélection avec options Aperçu, Téléchargement, Remplacement et Suppression.
 */
export default function FileUploader({
  value = '',
  fileName = '',
  fileSize,
  uploadDate,
  onChange,
  onRemove,
  label = 'Document PDF',
  hint = 'Format PDF uniquement · 10 Mo max',
  error,
  required = false,
}) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [localError, setLocalError] = useState('')
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const handleProcessFile = async (file) => {
    if (!file) return
    setLocalError('')
    setIsUploading(true)

    try {
      const result = await uploadFile(file)
      onChange({
        url: result.url,
        name: result.name,
        size: result.size,
      })
    } catch (err) {
      setLocalError(err.message || 'Erreur lors du téléversement du document.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    handleProcessFile(file)
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
    const file = e.dataTransfer.files?.[0]
    handleProcessFile(file)
  }

  const triggerSelect = () => {
    fileInputRef.current?.click()
  }

  const handleConfirmDelete = () => {
    onRemove()
    setShowConfirmDelete(false)
    setLocalError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayedError = error || localError
  const displayName = fileName || (value ? value.split('/').pop()?.split('?')[0] : 'Document.pdf')

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

      {/* Input natif masqué */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleInputChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {value ? (
        /* CARTE DE FICHIER PRÉSENT (Surface blanche, rounded-2xl, bordure fine) */
        <div className="p-4 bg-white border border-[#E8E4DF] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#C0392B]/10 text-[#C0392B] flex items-center justify-center shrink-0 border border-[#C0392B]/20">
                <PdfIcon size={20} />
              </div>
              <div className="min-w-0">
                <span className="text-[13.5px] font-semibold text-[#111111] block truncate" title={displayName}>
                  {displayName}
                </span>
                <div className="flex items-center gap-2 text-[12px] text-[#777777] mt-0.5 tabular-nums">
                  {fileSize ? <span>{formatFileSize(fileSize)}</span> : null}
                  {uploadDate ? <span>• Mis en ligne le {new Date(uploadDate).toLocaleDateString('fr-FR')}</span> : null}
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center gap-2 flex-wrap shrink-0 self-end sm:self-auto">
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                download={displayName}
                className="inline-flex items-center gap-1.5 h-9 px-3 bg-white border border-[#E8E4DF] rounded-xl text-[12.5px] font-medium text-[#111111] hover:bg-[#F8F6F4] transition-colors shadow-2xs"
              >
                <DownloadIcon size={14} />
                Télécharger
              </a>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white border border-[#E8E4DF] rounded-xl text-[#777777] hover:text-[#111111] hover:bg-[#F8F6F4] transition-colors shadow-2xs"
                title="Aperçu dans un nouvel onglet"
              >
                <ExternalLinkIcon size={14} />
              </a>
              <button
                type="button"
                onClick={triggerSelect}
                disabled={isUploading}
                className="inline-flex items-center gap-1 h-9 px-3 bg-white border border-[#E8E4DF] rounded-xl text-[12.5px] font-medium text-[#111111] hover:bg-[#F8F6F4] transition-colors shadow-2xs cursor-pointer"
              >
                <RefreshIcon size={13} className={isUploading ? 'animate-spin' : ''} />
                Remplacer
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                disabled={isUploading}
                className="p-2 rounded-xl text-[#777777] hover:text-[#C0392B] hover:bg-[#FDF2F0] transition-colors cursor-pointer"
                title="Supprimer ce document"
              >
                <TrashIcon size={14} />
              </button>
            </div>
          </div>

          {/* Confirmation de suppression intégrée */}
          {showConfirmDelete && (
            <div className="p-3 bg-[#FDF2F0] border border-[#C0392B]/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12.5px]">
              <span className="text-[#C0392B] font-medium">
                Voulez-vous vraiment supprimer ce document officiel ?
              </span>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="h-8 px-3 rounded-lg bg-white text-[#111111] border border-[#E8E4DF] hover:bg-[#F8F6F4] transition-colors cursor-pointer font-medium"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="h-8 px-3 rounded-lg bg-[#C0392B] text-white font-medium hover:bg-[#A93226] transition-colors cursor-pointer"
                >
                  Confirmer la suppression
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ZONE DE SÉLECTION / DÉPÔT (crème, filet pointillé fin) */
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
          aria-label={`${label} : Cliquez ou glissez-déposez le fichier PDF`}
          className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 focus:border-[#C0392B] ${
            isDragging
              ? 'border-[#C0392B] bg-[#C0392B]/5 text-[#C0392B]'
              : 'border-[#E8E4DF] hover:border-[#C0392B]/60 bg-[#FAF8F6] text-[#555555]'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <LoaderIcon size={24} className="text-[#C0392B] animate-spin" />
              <span className="text-[13px] font-medium text-[#111111]">
                Téléversement du fichier PDF...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-11 h-11 rounded-xl bg-white border border-[#E8E4DF] flex items-center justify-center text-[#777777] shadow-2xs">
                {isDragging ? <UploadIcon size={20} className="text-[#C0392B]" /> : <PdfIcon size={20} />}
              </div>
              <div>
                <p className="text-[13.5px] font-semibold text-[#111111]">
                  <span className="text-[#C0392B]">Cliquez pour sélectionner le PDF</span> ou glissez-le ici
                </p>
                <p className="text-[12px] text-[#777777] mt-0.5">
                  Fichier PDF officiel (max 10 Mo)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Erreur */}
      {displayedError && (
        <div className="flex items-center gap-1.5 text-[12px] text-[#C0392B] font-medium">
          <AlertCircleIcon size={13} className="shrink-0" />
          <span>{displayedError}</span>
        </div>
      )}
    </div>
  )
}
