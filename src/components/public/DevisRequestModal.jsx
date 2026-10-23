import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Layers,
  Paperclip,
  FileText,
  X,
  Loader2,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { useDevisModal } from '../../store/devisModalStore'
import devisService from '../../services/api/devis.service'
import { syncCrmMetrics } from '../../services/api/crmQuerySync'

const BESOIN_OPTIONS = [
  'Approvisionnement alimentaire complet selon mercuriale',
  'Denrées sèches & Épicerie de base',
  'Produits frais, Fruits & Légumes (température dirigée)',
  'Viandes, Volailles & Surgelés (-25°C)',
  'Boissons & Consommables de restauration collective',
  'Coordination logistique & Livraison sécurisée sur site minier',
]

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25 Mo

export default function DevisRequestModal() {
  const { isOpen, closeDevisModal, initialData } = useDevisModal()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const dropdownRef = useRef(null)

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const [form, setForm] = useState({
    societe: '',
    contact_nom: '',
    email: '',
    telephone: '',
    type_besoin: '',
    site_minier: '',
    volume_frequence: '',
    file: null,
    file_name: '',
    file_size_formatted: '',
  })

  const [errors, setErrors] = useState({})
  const [isDragging, setIsDragging] = useState(false)

  // Initialisation à l'ouverture
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        societe: initialData?.societe || '',
        contact_nom: initialData?.contact_nom || '',
        email: initialData?.email || '',
        telephone: initialData?.telephone || '',
        type_besoin: initialData?.type_besoin || initialData?.defaultNeed || '',
        site_minier: initialData?.site_minier || '',
        volume_frequence: initialData?.volume_frequence || '',
        file: null,
        file_name: '',
        file_size_formatted: '',
      })
      setErrors({})
      setIsDropdownOpen(false)
      // Empêche le défilement de fond
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setIsDropdownOpen(false)
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, initialData])

  // Fermeture du dropdown au clic en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fermeture sur touche Échap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeDevisModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeDevisModal])

  // Mutation TanStack Query
  const createMutation = useMutation({
    mutationFn: (formData) => devisService.createDevisRequest(formData),
    onSuccess: async () => {
      toast.success(
        'Votre demande a été transmise avec succès à notre équipe commerciale.',
        { duration: 5000 }
      )
      // Rafraîchissement instantané de toutes les métriques CRM et du Dashboard (0 ms)
      await syncCrmMetrics(queryClient)
      closeDevisModal()
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          'Une erreur est survenue lors de l’envoi. Veuillez réessayer ou nous contacter directement.'
      )
    },
  })

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      toast.error('Le fichier dépasse la taille maximale autorisée de 25 Mo.')
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

  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!form.societe.trim()) newErrors.societe = 'La société est obligatoire.'
    if (!form.contact_nom.trim()) newErrors.contact_nom = 'Le nom du contact est obligatoire.'
    if (!form.email.trim()) {
      newErrors.email = 'L’email professionnel est obligatoire.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Format d’email invalide.'
    }
    if (!form.telephone.trim()) newErrors.telephone = 'Le numéro de téléphone est obligatoire.'
    if (!form.type_besoin.trim()) newErrors.type_besoin = 'Veuillez préciser la nature de votre besoin.'
    if (!form.site_minier.trim()) newErrors.site_minier = 'Le site ou la localité est obligatoire.'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Veuillez renseigner tous les champs obligatoires (*).')
      return
    }

    const formData = new FormData()
    formData.append('societe', form.societe.trim())
    formData.append('contact_nom', form.contact_nom.trim())
    formData.append('email', form.email.trim())
    formData.append('telephone', form.telephone.trim())
    formData.append('type_besoin', form.type_besoin.trim())
    formData.append('site_minier', form.site_minier.trim())
    formData.append('volume_frequence', (form.volume_frequence || '').trim())
    formData.append('status', 'en_attente')

    if (form.file instanceof File) {
      formData.append('fichier', form.file)
      formData.append('fichier_upload', form.file)
      formData.append('document', form.file)
    }

    createMutation.mutate(formData)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="devis-modal-title"
    >
      {/* Fond obscurci avec flou */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeDevisModal}
        aria-hidden="true"
      />

      {/* Boîte Modale */}
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* En-tête */}
        <div className="relative px-6 pt-6 pb-5 border-b border-gray-100 bg-[#FAF8F6]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 shadow-2xs mb-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0" />
            <span className="text-[0.65rem] font-heading font-bold uppercase tracking-[0.16em] text-brand-red">
              DEMANDE DE DEVIS B2B
            </span>
          </div>

          <h2
            id="devis-modal-title"
            className="font-heading font-extrabold text-xl sm:text-2xl text-brand-black tracking-tight"
          >
            Approvisionnement & Logistique Alimentaire
          </h2>
          <p className="text-xs sm:text-[0.8125rem] text-gray-600 mt-1 leading-relaxed">
            Recevez une proposition technique et tarifaire sur mesure sous 24 à 48h ouvrées.
          </p>

          {/* Bouton Fermer */}
          <button
            type="button"
            onClick={closeDevisModal}
            aria-label="Fermer la fenêtre"
            className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-brand-black hover:bg-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-red"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corps du Formulaire défilable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Section 1 : Entreprise & Contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1.5 border-b border-gray-100">
              <Building2 size={15} className="text-brand-red" />
              <h3 className="text-[0.72rem] font-heading font-bold uppercase tracking-wider text-gray-500">
                1. Entreprise & Interlocuteur
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Société */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Société / Raison Sociale <span className="text-brand-red">*</span>
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="ex: Société Minière d'Ity, Bouygues..."
                    value={form.societe}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, societe: e.target.value }))
                      if (errors.societe) setErrors((prev) => ({ ...prev, societe: null }))
                    }}
                    className={`w-full h-11 pl-10 pr-3.5 text-xs bg-white border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/20 transition-all ${
                      errors.societe ? 'border-red-500 bg-red-50/20' : 'border-gray-200 focus:border-brand-red'
                    }`}
                  />
                </div>
                {errors.societe && <p className="text-[11px] text-red-600 mt-1">{errors.societe}</p>}
              </div>

              {/* Nom du contact */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Nom du Contact Référent <span className="text-brand-red">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="ex: Jean-Marc Koffi"
                    value={form.contact_nom}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, contact_nom: e.target.value }))
                      if (errors.contact_nom) setErrors((prev) => ({ ...prev, contact_nom: null }))
                    }}
                    className={`w-full h-11 pl-10 pr-3.5 text-xs bg-white border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/20 transition-all ${
                      errors.contact_nom ? 'border-red-500 bg-red-50/20' : 'border-gray-200 focus:border-brand-red'
                    }`}
                  />
                </div>
                {errors.contact_nom && <p className="text-[11px] text-red-600 mt-1">{errors.contact_nom}</p>}
              </div>

              {/* Email professionnel */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Email Professionnel <span className="text-brand-red">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="ex: contact@societe.ci"
                    value={form.email}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                      if (errors.email) setErrors((prev) => ({ ...prev, email: null }))
                    }}
                    className={`w-full h-11 pl-10 pr-3.5 text-xs bg-white border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/20 transition-all ${
                      errors.email ? 'border-red-500 bg-red-50/20' : 'border-gray-200 focus:border-brand-red'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
              </div>

              {/* Téléphone direct */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Téléphone Direct <span className="text-brand-red">*</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    placeholder="ex: +225 07 00 00 00"
                    value={form.telephone}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, telephone: e.target.value }))
                      if (errors.telephone) setErrors((prev) => ({ ...prev, telephone: null }))
                    }}
                    className={`w-full h-11 pl-10 pr-3.5 text-xs bg-white border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/20 transition-all ${
                      errors.telephone ? 'border-red-500 bg-red-50/20' : 'border-gray-200 focus:border-brand-red'
                    }`}
                  />
                </div>
                {errors.telephone && <p className="text-[11px] text-red-600 mt-1">{errors.telephone}</p>}
              </div>
            </div>
          </div>

          {/* Section 2 : Spécifications du Besoin & Chantier */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1.5 border-b border-gray-100">
              <Layers size={15} className="text-brand-red" />
              <h3 className="text-[0.72rem] font-heading font-bold uppercase tracking-wider text-gray-500">
                2. Nature du Besoin & Destination
              </h3>
            </div>

            {/* Type de besoin avec vrai menu déroulant + saisie libre */}
            <div ref={dropdownRef} className="relative">
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                Type de Besoin / Nature du projet <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Sélectionnez ou décrivez vos besoins (ex: Vivres frais, Surgelés...)"
                  value={form.type_besoin}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, type_besoin: e.target.value }))
                    if (errors.type_besoin) setErrors((prev) => ({ ...prev, type_besoin: null }))
                  }}
                  className={`w-full h-11 pl-3.5 pr-10 text-xs bg-white border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/20 transition-all ${
                    errors.type_besoin ? 'border-red-500 bg-red-50/20' : 'border-gray-200 focus:border-brand-red'
                  }`}
                />
                {/* Bouton flèche toujours cliquable qui ouvre/ferme la liste */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                  title="Afficher les suggestions"
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-brand-red' : ''}`}
                  />
                </button>
                {/* Vraie liste déroulante stylisée */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      Suggestions d'approvisionnement (ou saisissez librement) :
                    </div>
                    {BESOIN_OPTIONS.map((opt) => {
                      const isSelected = form.type_besoin === opt
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, type_besoin: opt }))
                            if (errors.type_besoin) setErrors((prev) => ({ ...prev, type_besoin: null }))
                            setIsDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-red-50 text-brand-red font-semibold'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-brand-black'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <Check size={14} className="text-brand-red shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
              {errors.type_besoin && <p className="text-[11px] text-red-600 mt-1">{errors.type_besoin}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Site minier / Localité */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Site Minier / Localité <span className="text-brand-red">*</span>
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="ex: Tongon, Ity, Yaouré, Bonikro, Abidjan..."
                    value={form.site_minier}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, site_minier: e.target.value }))
                      if (errors.site_minier) setErrors((prev) => ({ ...prev, site_minier: null }))
                    }}
                    className={`w-full h-11 pl-10 pr-3.5 text-xs bg-white border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/20 transition-all ${
                      errors.site_minier ? 'border-red-500 bg-red-50/20' : 'border-gray-200 focus:border-brand-red'
                    }`}
                  />
                </div>
                {errors.site_minier && <p className="text-[11px] text-red-600 mt-1">{errors.site_minier}</p>}
              </div>

              {/* Volume & Fréquence */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Volume & Fréquence <span className="text-gray-400 font-normal">(Optionnel)</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: 10 tonnes / mois, 500 rations/jour, livraison bi-hebdomadaire..."
                  value={form.volume_frequence}
                  onChange={(e) => setForm((prev) => ({ ...prev, volume_frequence: e.target.value }))}
                  className="w-full h-11 px-3.5 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3 : Fichier / Cahier des charges joint */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-gray-100">
              <Paperclip size={15} className="text-brand-red" />
              <h3 className="text-[0.72rem] font-heading font-bold uppercase tracking-wider text-gray-500">
                3. Mercuriale, Liste de Denrées ou Cahier des charges (Optionnel)
              </h3>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.png,.jpg,.jpeg"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
              className="sr-only"
            />

            {form.file_name ? (
              <div className="p-3.5 rounded-2xl bg-[#FAF8F6] border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-brand-red flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-gray-900 truncate block">
                      {form.file_name}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Taille : {form.file_size_formatted}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-brand-red hover:bg-red-50 transition-colors cursor-pointer"
                  title="Retirer le fichier"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  const droppedFile = e.dataTransfer.files?.[0]
                  if (droppedFile) handleFileSelect(droppedFile)
                }}
                className={`p-5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-brand-red bg-red-50/30'
                    : 'border-gray-200 hover:border-brand-red/60 bg-[#FAF8F6]'
                }`}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <Paperclip size={22} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-800">
                    <span className="text-brand-red">Joindre votre mercuriale</span> ou document (Excel, PDF, Word max 25 Mo)
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Glissez-déposez votre fichier de mercuriale ou cliquez pour parcourir
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Note de confidentialité */}
          <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-500">
            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
            <span>
              Vos données et documents techniques restent strictement confidentiels.
            </span>
          </div>

          {/* Boutons d'action */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeDevisModal}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider text-white bg-brand-red hover:bg-brand-red-dark shadow-md shadow-brand-red/20 transition-all disabled:opacity-60 cursor-pointer"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Transmission...</span>
                </>
              ) : (
                <>
                  <span>Transmettre ma demande</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
