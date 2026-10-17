import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  MessageSquare,
  X,
  Loader2,
  ArrowRight,
  BedDouble,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useReservationModal } from '../../store/reservationModalStore'
import { createHebergementRequest } from '../../services/api/hebergementRequest.service'
import { syncCrmMetrics } from '../../services/api/crmQuerySync'

export default function ReservationStayModal({
  residence: propResidence,
  isOpen: propIsOpen,
  onClose: propOnClose,
}) {
  const store = useReservationModal()

  // Supporte le contrôle via props directes OU via le store global
  const isOpen = propIsOpen !== undefined ? propIsOpen : store.isOpen
  const handleClose = propOnClose || store.closeReservationModal
  const selectedResidence = propResidence || store.residence || 'Résidence Executive - Plateau'

  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    entreprise: '',
    nom_contact: '',
    email: '',
    telephone: '',
    date_debut: '',
    date_fin: '',
    nombre_personnes: 1,
    details: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        entreprise: store.initialData?.entreprise || '',
        nom_contact: store.initialData?.nom_contact || store.initialData?.contact || '',
        email: store.initialData?.email || '',
        telephone: store.initialData?.telephone || '',
        date_debut: store.initialData?.date_debut || '',
        date_fin: store.initialData?.date_fin || '',
        nombre_personnes: store.initialData?.nombre_personnes || 1,
        details: store.initialData?.details || store.initialData?.message || '',
      })
      setErrors({})
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, store.initialData])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  // Blocage physique des touches alphabétiques sur le champ téléphone
  const handlePhoneKeyDown = (e) => {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Enter',
      'Home',
      'End',
    ]
    if (allowedKeys.includes(e.key)) return
    if (e.ctrlKey || e.metaKey) return
    if (!/[0-9+\s().-]/.test(e.key)) {
      e.preventDefault()
    }
  }

  const handlePhoneChange = (e) => {
    const cleaned = e.target.value.replace(/[^0-9+\s().-]/g, '')
    setForm((prev) => ({ ...prev, telephone: cleaned }))
    if (errors.telephone) setErrors((prev) => ({ ...prev, telephone: '' }))
  }

  const validate = () => {
    const newErrors = {}

    if (!form.entreprise.trim()) {
      newErrors.entreprise = 'La raison sociale de l’entreprise est requise'
    } else if (form.entreprise.trim().length < 2) {
      newErrors.entreprise = 'L’entreprise doit comporter au moins 2 caractères'
    }

    if (!form.nom_contact.trim()) {
      newErrors.nom_contact = 'Le nom du contact est requis'
    } else if (form.nom_contact.trim().length < 2) {
      newErrors.nom_contact = 'Le nom doit comporter au moins 2 caractères'
    }

    if (!form.email.trim()) {
      newErrors.email = 'L’email professionnel est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Format d’email invalide'
    }

    if (form.telephone && form.telephone.trim()) {
      const digits = form.telephone.replace(/\D/g, '')
      if (digits.length < 8) {
        newErrors.telephone = 'Le numéro de téléphone doit comporter au moins 8 chiffres'
      }
    }

    if (!form.date_debut) {
      newErrors.date_debut = 'La date d’arrivée est requise'
    }

    if (!form.date_fin) {
      newErrors.date_fin = 'La date de départ est requise'
    } else if (form.date_debut && form.date_fin < form.date_debut) {
      newErrors.date_fin = 'La date de départ doit être postérieure à la date d’arrivée'
    }

    if (!form.nombre_personnes || Number(form.nombre_personnes) < 1) {
      newErrors.nombre_personnes = 'Le nombre de résidents doit être d’au moins 1 personne'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const createMutation = useMutation({
    mutationFn: (data) => createHebergementRequest(data),
    onSuccess: async () => {
      toast.success('Votre demande de réservation a été transmise avec succès.', {
        duration: 5000,
        icon: <CheckCircle2 className="text-emerald-600" size={18} />,
      })
      // Rafraîchissement instantané de toutes les métriques CRM et du Dashboard (0 ms)
      await syncCrmMetrics(queryClient)
      handleClose()
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          'Une erreur est survenue lors de l’envoi de votre réservation. Veuillez réessayer.'
      )
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Veuillez compléter correctement tous les champs obligatoires (*).')
      return
    }

    // Formatage de la période textuelle ex: "01/11/2026 - 15/12/2026"
    const formatDateFR = (dStr) => {
      if (!dStr) return ''
      const [y, m, d] = dStr.split('-')
      return `${d}/${m}/${y}`
    }

    const datesSejour = `${formatDateFR(form.date_debut)} - ${formatDateFR(form.date_fin)}`

    createMutation.mutate({
      entreprise: form.entreprise.trim(),
      nom_contact: form.nom_contact.trim(),
      email: form.email.trim(),
      telephone: form.telephone.trim(),
      residence: selectedResidence,
      type_residence: selectedResidence,
      dates_sejour: datesSejour,
      date_debut: form.date_debut,
      date_fin: form.date_fin,
      nombre_personnes: Number(form.nombre_personnes),
      message: form.details.trim(),
      details: form.details.trim(),
    })
  }

  if (!isOpen) return null

  // Date minimale pour l'arrivée : aujourd'hui
  const today = new Date().toISOString().split('T')[0]

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-reservation-title"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bandeau d'en-tête */}
        <div className="bg-gradient-to-r from-[#111111] via-[#1F1F1F] to-[#2B2B2B] p-6 sm:p-8 text-white relative">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs border border-white/10">
              <BedDouble size={14} className="text-[#C0392B]" />
              <span>PÔLE HÉBERGEMENT CORPORATE & RÉSIDENCES</span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Fermer la boîte de dialogue"
            >
              <X size={20} />
            </button>
          </div>

          <h2 id="modal-reservation-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-3">
            Demande de Disponibilité & Réservation
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-lg leading-relaxed">
            Bloquez votre hébergement haut standing pour vos délégations, auditeurs et consultants en mission à Abidjan.
          </p>

          {/* Badge visuel Résidence sélectionnée (non modifiable) */}
          <div className="mt-4 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C0392B] text-white flex items-center justify-center shrink-0">
              <Building2 size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-300 block">
                Résidence ciblée
              </span>
              <p className="text-xs sm:text-sm font-bold text-white truncate">
                {selectedResidence}
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[calc(85vh-140px)] overflow-y-auto" noValidate>
          {/* Entreprise & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                Entreprise / Raison Sociale <span className="text-[#C0392B]">*</span>
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ex: Endeavour Mining, Perseus, PwC..."
                  value={form.entreprise}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, entreprise: e.target.value }))
                    if (errors.entreprise) setErrors((prev) => ({ ...prev, entreprise: '' }))
                  }}
                  className={`w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-[#FAF8F6] border rounded-xl text-[#111111] placeholder-gray-400 focus:outline-none focus:bg-white transition-all ${
                    errors.entreprise
                      ? 'border-red-500 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-[#E8E4DF] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15'
                  }`}
                  required
                />
              </div>
              {errors.entreprise && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{errors.entreprise}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                Nom & Prénom du Contact <span className="text-[#C0392B]">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ex: Sophie Koné (Resp. Logistique)"
                  value={form.nom_contact}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, nom_contact: e.target.value }))
                    if (errors.nom_contact) setErrors((prev) => ({ ...prev, nom_contact: '' }))
                  }}
                  className={`w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-[#FAF8F6] border rounded-xl text-[#111111] placeholder-gray-400 focus:outline-none focus:bg-white transition-all ${
                    errors.nom_contact
                      ? 'border-red-500 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-[#E8E4DF] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15'
                  }`}
                  required
                />
              </div>
              {errors.nom_contact && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{errors.nom_contact}</span>
                </p>
              )}
            </div>
          </div>

          {/* Email & Téléphone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                Email Professionnel <span className="text-[#C0392B]">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="contact@entreprise.com"
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
                  required
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                Téléphone Direct <span className="text-gray-400 font-normal lowercase">(optionnel)</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="Ex: +225... / +221..."
                  value={form.telephone}
                  onKeyDown={handlePhoneKeyDown}
                  onChange={handlePhoneChange}
                  className={`w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-[#FAF8F6] border rounded-xl text-[#111111] placeholder-gray-400 focus:outline-none focus:bg-white transition-all ${
                    errors.telephone
                      ? 'border-red-500 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-[#E8E4DF] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15'
                  }`}
                />
              </div>
              {errors.telephone && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{errors.telephone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Dates du séjour & Effectif */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                Date d&apos;arrivée <span className="text-[#C0392B]">*</span>
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  min={today}
                  value={form.date_debut}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, date_debut: e.target.value }))
                    if (errors.date_debut) setErrors((prev) => ({ ...prev, date_debut: '' }))
                  }}
                  className={`w-full h-11 pl-10 pr-3 text-xs sm:text-sm bg-[#FAF8F6] border rounded-xl text-[#111111] focus:outline-none focus:bg-white transition-all ${
                    errors.date_debut
                      ? 'border-red-500 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-[#E8E4DF] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15'
                  }`}
                  required
                />
              </div>
              {errors.date_debut && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{errors.date_debut}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                Date de départ <span className="text-[#C0392B]">*</span>
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  min={form.date_debut || today}
                  value={form.date_fin}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, date_fin: e.target.value }))
                    if (errors.date_fin) setErrors((prev) => ({ ...prev, date_fin: '' }))
                  }}
                  className={`w-full h-11 pl-10 pr-3 text-xs sm:text-sm bg-[#FAF8F6] border rounded-xl text-[#111111] focus:outline-none focus:bg-white transition-all ${
                    errors.date_fin
                      ? 'border-red-500 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-[#E8E4DF] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15'
                  }`}
                  required
                />
              </div>
              {errors.date_fin && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{errors.date_fin}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                Nombre de résidents <span className="text-[#C0392B]">*</span>
              </label>
              <div className="relative">
                <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.nombre_personnes}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, nombre_personnes: e.target.value }))
                    if (errors.nombre_personnes) setErrors((prev) => ({ ...prev, nombre_personnes: '' }))
                  }}
                  className={`w-full h-11 pl-10 pr-3 text-xs sm:text-sm bg-[#FAF8F6] border rounded-xl text-[#111111] focus:outline-none focus:bg-white transition-all ${
                    errors.nombre_personnes
                      ? 'border-red-500 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-[#E8E4DF] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15'
                  }`}
                  required
                />
              </div>
              {errors.nombre_personnes && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>{errors.nombre_personnes}</span>
                </p>
              )}
            </div>
          </div>

          {/* Besoins spécifiques / Détails */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
              Besoins spécifiques & Détails du séjour <span className="text-gray-400 font-normal lowercase">(optionnel)</span>
            </label>
            <div className="relative">
              <MessageSquare size={16} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
              <textarea
                rows={3}
                placeholder="Ex: Demande de navette aéroport, connexion fibre très haut débit pour visioconférences, service de conciergerie..."
                value={form.details}
                onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
                className="w-full pl-10 pr-3.5 py-3 text-xs sm:text-sm bg-[#FAF8F6] border border-[#E8E4DF] rounded-xl text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#C0392B] focus:bg-white focus:ring-2 focus:ring-[#C0392B]/15 transition-all resize-none"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
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
                  <span>Transmission de la réservation...</span>
                </>
              ) : (
                <>
                  <span>Confirmer ma demande de séjour</span>
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
