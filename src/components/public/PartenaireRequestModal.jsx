import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  User,
  Mail,
  Phone,
  Wrench,
  Paperclip,
  FileText,
  X,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { usePartenaireModal } from '../../store/partenaireModalStore'
import { createPartenaireRequest } from '../../services/api/partenaire.service'
import { syncCrmMetrics } from '../../services/api/crmQuerySync'

const EXPERTISES_SUGGESTIONS = [
  'Production Maraîchère & Légumes Frais Locaux',
  'Fruits Frais & Produits Agricoles de Côte d’Ivoire',
  'Élevage, Abattoir Agréé & Volailles',
  'Viandes Rouges, Bovins & Porcins',
  'Poissons, Crustacés & Produits Halieutiques',
  'Produits Surgelés sous Température Dirigée (-25°C)',
  'Denrées Sèches, Riz, Huiles & Épicerie de Base',
  'Transport Frigorifique & Logistique Température Contrôlée',
  'Transport Routier Tout-Terrain & Pistes Minières',
  'Conditionnement, Emballages & Consommables Alimentaires',
  'Contrôle Sanitaire, Analyses & Certification HACCP',
]

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25 Mo

export default function PartenaireRequestModal() {
  const { isOpen, closePartenaireModal, initialData } = usePartenaireModal()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    societe: '',
    contact: '',
    email: '',
    telephone: '',
    type_service: '',
    description: '',
    file: null,
    file_name: '',
    file_size_formatted: '',
  })

  const [errors, setErrors] = useState({})
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        societe: initialData?.societe || '',
        contact: initialData?.contact || initialData?.contact_nom || '',
        email: initialData?.email || '',
        telephone: initialData?.telephone || '',
        type_service: initialData?.type_service || initialData?.prestation || '',
        description: initialData?.description || '',
        file: null,
        file_name: '',
        file_size_formatted: '',
      })
      setErrors({})
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, initialData])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closePartenaireModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closePartenaireModal])

  const createMutation = useMutation({
    mutationFn: (formData) => createPartenaireRequest(formData),
    onSuccess: async () => {
      toast.success('Votre candidature partenaire a été enregistrée avec succès.', {
        duration: 5000,
        icon: <CheckCircle2 className="text-emerald-600" size={18} />,
      })
      // Rafraîchissement instantané de toutes les métriques CRM et du Dashboard (0 ms)
      await syncCrmMetrics(queryClient)
      closePartenaireModal()
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          'Une erreur est survenue lors de l’envoi de votre candidature. Veuillez réessayer.'
      )
    },
  })

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      toast.error('Le dossier dépasse la taille maximale autorisée de 25 Mo.')
      return
    }

    const sizeInMo = (selectedFile.size / (1024 * 1024)).toFixed(1)
    const formattedSize =
      selectedFile.size < 1024 * 1024
        ? `${Math.round(selectedFile.size / 1024)} Ko`
        : `${sizeInMo} Mo`

    setForm((prev) => ({
      ...prev,
      file: selectedFile,
      file_name: selectedFile.name,
      file_size_formatted: formattedSize,
    }))
  }

  const handleRemoveFile = (e) => {
    e.stopPropagation()
    setForm((prev) => ({
      ...prev,
      file: null,
      file_name: '',
      file_size_formatted: '',
    }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validate = () => {
    const newErrors = {}
    if (!form.societe.trim()) {
      newErrors.societe = 'La raison sociale est requise'
    } else if (form.societe.trim().length < 3) {
      newErrors.societe = 'La raison sociale doit comporter au moins 3 caractères'
    }

    if (!form.contact.trim()) {
      newErrors.contact = 'Le nom du contact est requis'
    } else if (form.contact.trim().length < 3) {
      newErrors.contact = 'Le nom du contact doit comporter au moins 3 caractères'
    }

    if (!form.email.trim()) {
      newErrors.email = 'L’email professionnel est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Format d’email invalide'
    }

    const digits = (form.telephone || '').replace(/\D/g, '')
    if (!form.telephone.trim()) {
      newErrors.telephone = 'Le numéro de téléphone est requis'
    } else if (digits.length < 8) {
      newErrors.telephone = 'Le numéro de téléphone doit comporter au moins 8 chiffres'
    }

    if (!form.type_service || form.type_service.trim().length < 2) {
      newErrors.type_service = 'Veuillez préciser votre domaine d’expertise (au moins 2 caractères)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Veuillez compléter correctement tous les champs obligatoires (*).')
      return
    }

    const formData = new FormData()
    formData.append('societe', form.societe.trim())
    formData.append('contact', form.contact.trim())
    formData.append('contact_nom', form.contact.trim())
    formData.append('email', form.email.trim())
    formData.append('telephone', form.telephone.trim())
    formData.append('type_service', form.type_service.trim())
    formData.append('prestation', form.type_service.trim())

    if (form.description.trim()) {
      formData.append('description', form.description.trim())
    }

    if (form.file) {
      formData.append('fichier', form.file)
      formData.append('file', form.file)
    }

    createMutation.mutate(formData)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={closePartenaireModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-partenaire-title"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bandeau d'en-tête */}
        <div className="bg-gradient-to-r from-[#111111] via-[#1F1F1F] to-[#2B2B2B] p-6 sm:p-8 text-white relative">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs border border-white/10">
              <ShieldCheck size={14} className="text-[#C0392B]" />
              <span>Agrément Fournisseurs & Sous-traitants</span>
            </div>
            <button
              type="button"
              onClick={closePartenaireModal}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Fermer la boîte de dialogue"
            >
              <X size={20} />
            </button>
          </div>

          <h2 id="modal-partenaire-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-3">
            Devenir Partenaire & Référencement
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-lg leading-relaxed">
            Intégrez le panel d&apos;intervenants et sous-traitants qualifiés de FL STRUCTURES pour nos chantiers miniers, industriels et bases-vie en Afrique et à l&apos;international.
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[calc(85vh-140px)] overflow-y-auto">
          {/* Grille Société & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                Société / Raison Sociale <span className="text-[#C0392B]">*</span>
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ex: Sahel Engineering, Atlas Levage, Global Services SA..."
                  value={form.societe}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, societe: e.target.value }))
                    if (errors.societe) setErrors((prev) => ({ ...prev, societe: '' }))
                  }}
                  className={`w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-[#FAF8F6] border rounded-xl text-[#111111] placeholder-gray-400 focus:outline-none focus:bg-white transition-all ${
                    errors.societe
                      ? 'border-red-500 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-[#E8E4DF] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15'
                  }`}
                />
              </div>
              {errors.societe && <p className="text-[11px] text-red-600 mt-1">{errors.societe}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                Nom & Prénom du Contact <span className="text-[#C0392B]">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ex: Kouassi Kouamé (Dir. Technique)"
                  value={form.contact}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, contact: e.target.value }))
                    if (errors.contact) setErrors((prev) => ({ ...prev, contact: '' }))
                  }}
                  className={`w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-[#FAF8F6] border rounded-xl text-[#111111] placeholder-gray-400 focus:outline-none focus:bg-white transition-all ${
                    errors.contact
                      ? 'border-red-500 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-[#E8E4DF] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15'
                  }`}
                />
              </div>
              {errors.contact && <p className="text-[11px] text-red-600 mt-1">{errors.contact}</p>}
            </div>
          </div>

          {/* Grille Email & Téléphone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                Email Professionnel <span className="text-[#C0392B]">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="contact@societe.com"
                  value={form.email}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                  }}
                  className={`w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-[#FAF8F6] border rounded-xl text-[#111111] placeholder-gray-400 focus:outline-none focus:bg-white transition-all ${
                    errors.email
                      ? 'border-red-500 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-[#E8E4DF] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15'
                  }`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                Téléphone Direct <span className="text-[#C0392B]">*</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="Ex: +225... / +221... / +33... / +226..."
                  value={form.telephone}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9+\s().-]/g, '')
                    setForm((prev) => ({ ...prev, telephone: cleaned }))
                    if (errors.telephone) setErrors((prev) => ({ ...prev, telephone: '' }))
                  }}
                  className={`w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-[#FAF8F6] border rounded-xl text-[#111111] placeholder-gray-400 focus:outline-none focus:bg-white transition-all ${
                    errors.telephone
                      ? 'border-red-500 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-[#E8E4DF] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15'
                  }`}
                />
              </div>
              {errors.telephone && <p className="text-[11px] text-red-600 mt-1">{errors.telephone}</p>}
            </div>
          </div>

          {/* Domaine d'expertise / Prestation (Saisie libre avec suggestions datalist) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#333333]">
              Domaine d&apos;Expertise / Prestation <span className="text-[#C0392B]">*</span>
            </label>
            <div className="relative">
              <Wrench size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                list="expertises-list"
                value={form.type_service}
                onChange={(e) => {
                  const val = e.target.value
                  setForm((prev) => ({ ...prev, type_service: val }))
                  if (errors.type_service) setErrors((prev) => ({ ...prev, type_service: '' }))
                }}
                placeholder="Sélectionnez ou saisissez librement votre spécialité..."
                className={`w-full h-11 pl-10 pr-4 text-xs sm:text-sm bg-[#FAF8F6] border rounded-xl text-[#111111] placeholder-gray-400 focus:outline-none focus:bg-white transition-all shadow-xs ${
                  errors.type_service
                    ? 'border-red-500 focus:border-red-500 ring-2 ring-red-100'
                    : 'border-[#E8E4DF] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15'
                }`}
                required
              />
              <datalist id="expertises-list">
                {EXPERTISES_SUGGESTIONS.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>
            {errors.type_service && <p className="text-[11px] text-red-600 mt-1">{errors.type_service}</p>}
            <p className="text-[11px] text-neutral-500">
              Choisissez une suggestion dans la liste ou saisissez directement votre métier.
            </p>
          </div>

          {/* Présentation succincte / Références */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
              Présentation, Moyens Matériels & Références Minières <span className="text-gray-400 font-normal lowercase">(optionnel)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Équipements disponibles, certifications QHSE/ISO, agréments techniques, historique d'interventions..."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full p-3.5 text-xs sm:text-sm bg-[#FAF8F6] border border-[#E8E4DF] rounded-xl text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#C0392B] focus:bg-white focus:ring-2 focus:ring-[#C0392B]/15 transition-all resize-none"
            />
          </div>

          {/* Téléversement Fichier / Dossier d'agrément (DFE, Kbis, Plaquette max 25 Mo) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
              Dossier d&apos;Agrément ou Plaquette Technique <span className="text-gray-400 font-normal lowercase">(PDF, DOC, DOCX - max 25 Mo)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
              className="hidden"
            />

            {!form.file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  if (e.dataTransfer.files?.[0]) {
                    handleFileSelect(e.dataTransfer.files[0])
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#C0392B] bg-red-50/50'
                    : 'border-[#E8E4DF] bg-[#FAF8F6] hover:bg-white hover:border-[#C0392B]/60'
                }`}
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-white border border-[#E8E4DF] flex items-center justify-center text-[#C0392B] mb-2 shadow-2xs">
                  <Paperclip size={18} />
                </div>
                <p className="text-xs font-semibold text-[#111111]">
                  Cliquez pour joindre votre dossier d&apos;agrément (DFE, Kbis, Références)
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">ou glissez-déposez le document ici (25 Mo max)</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 bg-red-50/60 border border-red-200/80 rounded-2xl">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#C0392B] text-white flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#111111] truncate">{form.file_name}</p>
                    <p className="text-[11px] text-gray-500 font-mono">{form.file_size_formatted}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                  title="Supprimer la pièce jointe"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={closePartenaireModal}
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-[#555555] bg-white border border-[#E8E4DF] hover:bg-[#FAF8F6] transition-colors cursor-pointer text-center"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#C0392B] hover:bg-[#A93226] shadow-md hover:shadow-lg hover:shadow-[#C0392B]/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Envoi du dossier...</span>
                </>
              ) : (
                <>
                  <span>Soumettre ma candidature</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
