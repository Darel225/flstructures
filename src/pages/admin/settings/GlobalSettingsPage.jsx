import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  SettingsIcon,
  PhoneIcon,
  MailIcon,
  PdfIcon,
  CheckIcon,
  ClockIcon,
  LoaderIcon,
  DownloadIcon,
  RefreshIcon,
  TrashIcon,
  UploadIcon,
  AlertCircleIcon,
} from '../../../components/admin/icons/AdminIcons'
import {
  getSettings,
  updateSettings,
  getMercurialeUrl,
} from '../../../services/api/settings.service'

export default function GlobalSettingsPage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)

  // 1. Récupération des paramètres généraux depuis l'API MySQL
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: getSettings,
  })

  // 2. États locaux du formulaire
  const [telephonePrincipal, setTelephonePrincipal] = useState('')
  const [emailReceptionLeads, setEmailReceptionLeads] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isMercurialeRemoved, setIsMercurialeRemoved] = useState(false)
  const [errors, setErrors] = useState({})

  // Pré-remplissage des champs avec les données actuelles de la base
  useEffect(() => {
    if (settings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTelephonePrincipal(settings.telephone_principal || '')
      setEmailReceptionLeads(settings.email_reception_leads || '')
      setSelectedFile(null)
      setIsMercurialeRemoved(false)
      setErrors({})
    }
  }, [settings])

  // 3. Mutation de sauvegarde
  const updateMutation = useMutation({
    mutationFn: (formData) => updateSettings(formData),
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      queryClient.invalidateQueries({ queryKey: ['settings', 'global'] })
      queryClient.invalidateQueries({ queryKey: ['public-settings'] })
      setSelectedFile(null)
      setIsMercurialeRemoved(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      toast.success('Paramètres généraux mis à jour avec succès.')
      if (updatedData) {
        setTelephonePrincipal(updatedData.telephone_principal || '')
        setEmailReceptionLeads(updatedData.email_reception_leads || '')
      }
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          'Une erreur est survenue lors de la sauvegarde des paramètres.'
      )
    },
  })

  // 4. Gestion de la sélection de fichier
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Veuillez sélectionner un fichier au format PDF uniquement.')
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error('Le fichier PDF dépasse la taille maximale autorisée de 25 Mo.')
      return
    }

    setSelectedFile(file)
    setIsMercurialeRemoved(false)
  }

  // 5. Validation et soumission
  const handleSubmit = (e) => {
    e?.preventDefault()
    const newErrors = {}

    if (!telephonePrincipal.trim()) {
      newErrors.telephone_principal = 'Le numéro de téléphone principal est requis.'
    }

    if (!emailReceptionLeads.trim()) {
      newErrors.email_reception_leads = 'L’adresse email de réception des leads est requise.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailReceptionLeads.trim())) {
      newErrors.email_reception_leads = 'Format d’adresse email invalide.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Veuillez corriger les erreurs dans le formulaire.')
      return
    }

    setErrors({})

    const formData = new FormData()
    formData.append('telephone_principal', telephonePrincipal.trim())
    formData.append('email_reception_leads', emailReceptionLeads.trim())

    if (selectedFile) {
      formData.append('fichier_mercuriale_globale', selectedFile)
      formData.append('mercuriale', selectedFile)
    } else if (isMercurialeRemoved) {
      formData.append('remove_mercuriale', '1')
      formData.append('supprimer_mercuriale', '1')
    }

    updateMutation.mutate(formData)
  }

  const currentMercurialeUrl = getMercurialeUrl(settings?.fichier_mercuriale_globale)
  const hasExistingMercuriale = Boolean(currentMercurialeUrl) && !isMercurialeRemoved

  return (
    <div className="space-y-6 max-w-5xl">
      {/* En-tête de page épuré avec bouton d'enregistrement en haut à droite */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DF]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E4DF] flex items-center justify-center text-[#111111] shadow-2xs">
            <SettingsIcon size={20} />
          </div>
          <div>
            <h1 className="fl-admin-title-page text-[#111111]">
              Paramètres Généraux
            </h1>
            <p className="text-xs text-[#777777] mt-0.5">
              Configuration de la ligne d&apos;astreinte, du routage des alertes et de la mercuriale tarifaire.
            </p>
          </div>
        </div>

        {/* Bouton d'enregistrement principal (en haut à droite) */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={updateMutation.isPending}
          className="inline-flex items-center gap-2 px-5 h-11 bg-[#C0392B] hover:bg-[#A93226] text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-all shrink-0 self-start sm:self-auto cursor-pointer"
        >
          {updateMutation.isPending ? (
            <>
              <LoaderIcon size={15} className="animate-spin" />
              <span>Enregistrement...</span>
            </>
          ) : (
            <>
              <CheckIcon size={15} />
              <span>Enregistrer les modifications</span>
            </>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-[#777777] flex flex-col items-center justify-center gap-3">
          <LoaderIcon size={24} className="animate-spin text-[#C0392B]" />
          <span className="text-sm">Chargement des paramètres de la plateforme...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Input file caché déclenché programmatiquement */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* SECTION 1 : LIGNE DIRECTE & ASTREINTE */}
          <div className="p-6 bg-white rounded-2xl border border-[#E8E4DF] shadow-2xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E8E4DF]">
              <div className="w-9 h-9 rounded-xl bg-[#F8F6F4] text-[#111111] border border-[#E8E4DF] flex items-center justify-center">
                <PhoneIcon size={18} />
              </div>
              <div>
                <h2 className="fl-admin-title-card text-[#111111]">
                  Ligne Directe & Astreinte 24/7
                </h2>
                <p className="text-xs text-[#777777] mt-0.5">
                  Numéro d&apos;astreinte diffusé sur le portail public et dans les formulaires.
                </p>
              </div>
            </div>

            <div className="max-w-xl pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                Numéro(s) de téléphone principal <span className="text-[#C0392B]">*</span>
              </label>
              <div className="relative">
                <PhoneIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={telephonePrincipal}
                  onChange={(e) => {
                    setTelephonePrincipal(e.target.value)
                    if (errors.telephone_principal) setErrors((prev) => ({ ...prev, telephone_principal: '' }))
                  }}
                  placeholder="+225 27 21 00 00 00 / +225 07 00 00 00 00"
                  className={`w-full h-11 pl-10 pr-3 text-xs sm:text-sm bg-[#FAF8F6] border rounded-xl text-[#111111] focus:outline-none focus:bg-white transition-all ${
                    errors.telephone_principal
                      ? 'border-red-500 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-[#E8E4DF] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15'
                  }`}
                  required
                />
              </div>
              {errors.telephone_principal && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircleIcon size={12} />
                  <span>{errors.telephone_principal}</span>
                </p>
              )}
            </div>
          </div>

          {/* SECTION 2 : ROUTAGE DES LEADS B2B */}
          <div className="p-6 bg-white rounded-2xl border border-[#E8E4DF] shadow-2xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E8E4DF]">
              <div className="w-9 h-9 rounded-xl bg-[#F8F6F4] text-[#111111] border border-[#E8E4DF] flex items-center justify-center">
                <MailIcon size={18} />
              </div>
              <div>
                <h2 className="fl-admin-title-card text-[#111111]">
                  Routage des Alertes Commerciales
                </h2>
                <p className="text-xs text-[#777777] mt-0.5">
                  Boîte de messagerie destinataire des demandes de devis, partenariats et réservations.
                </p>
              </div>
            </div>

            <div className="max-w-xl pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                Adresse email de réception des leads <span className="text-[#C0392B]">*</span>
              </label>
              <div className="relative">
                <MailIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={emailReceptionLeads}
                  onChange={(e) => {
                    setEmailReceptionLeads(e.target.value)
                    if (errors.email_reception_leads) setErrors((prev) => ({ ...prev, email_reception_leads: '' }))
                  }}
                  placeholder="direction.commerciale@fl-structures.ci"
                  className={`w-full h-11 pl-10 pr-3 text-xs sm:text-sm bg-[#FAF8F6] border rounded-xl text-[#111111] focus:outline-none focus:bg-white transition-all ${
                    errors.email_reception_leads
                      ? 'border-red-500 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-[#E8E4DF] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15'
                  }`}
                  required
                />
              </div>
              {errors.email_reception_leads && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircleIcon size={12} />
                  <span>{errors.email_reception_leads}</span>
                </p>
              )}
            </div>
          </div>

          {/* SECTION 3 : MERCURIALE TARIFAIRE GLOBALE */}
          <div className="p-6 bg-white rounded-2xl border border-[#E8E4DF] shadow-2xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E8E4DF]">
              <div className="w-9 h-9 rounded-xl bg-[#F8F6F4] text-[#111111] border border-[#E8E4DF] flex items-center justify-center">
                <PdfIcon size={18} />
              </div>
              <div>
                <h2 className="fl-admin-title-card text-[#111111]">
                  Mercuriale Tarifaire Globale
                </h2>
                <p className="text-xs text-[#777777] mt-0.5">
                  Document PDF officiel téléchargeable par les clients sur le portail public (/a-propos et footer).
                </p>
              </div>
            </div>

            <div className="pt-1">
              {/* CAS 1 : NOUVEAU FICHIER SÉLECTIONNÉ AU CLAVIER / FILE PICKER */}
              {selectedFile ? (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                      <PdfIcon size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-[#111111] truncate">
                          {selectedFile.name}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900 shrink-0">
                          Nouveau fichier prêt
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
                        {(selectedFile.size / 1024).toFixed(0)} Ko · Cliquez sur &quot;Enregistrer les modifications&quot; pour téléverser
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-[#111111] hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <RefreshIcon size={13} />
                      <span>Changer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <TrashIcon size={13} />
                      <span>Annuler</span>
                    </button>
                  </div>
                </div>
              ) : hasExistingMercuriale ? (
                /* CAS 2 : FICHIER ACTUEL EXISTANT EN BASE */
                <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#E8E4DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#C0392B] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <PdfIcon size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-[#111111] truncate">
                          {settings.nom_fichier_mercuriale || 'Mercuriale_Tarifaire_FL_Structures.pdf'}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                          PDF Actif
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                        Accessible au public via le bouton &quot;Dossier Fournisseur / Mercuriale&quot;
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Bouton Télécharger : lien direct ouvrant dans un nouvel onglet */}
                    <a
                      href={currentMercurialeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E8E4DF] text-xs font-semibold text-[#111111] hover:bg-gray-50 transition-colors shadow-2xs"
                    >
                      <DownloadIcon size={14} className="text-[#C0392B]" />
                      <span>Télécharger</span>
                    </a>

                    {/* Bouton Remplacer : déclenche le sélecteur de fichier PDF */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E8E4DF] text-xs font-semibold text-[#111111] hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
                    >
                      <RefreshIcon size={14} />
                      <span>Remplacer</span>
                    </button>

                    {/* Bouton Supprimer (Poubelle) */}
                    <button
                      type="button"
                      onClick={() => setIsMercurialeRemoved(true)}
                      className="p-2 rounded-xl bg-white border border-red-100 text-red-600 hover:bg-red-50 transition-colors shadow-2xs cursor-pointer"
                      title="Supprimer la mercuriale"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              ) : isMercurialeRemoved ? (
                /* CAS 3 : FICHIER MARQUÉ COMME SUPPRIMÉ */
                <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <TrashIcon size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-red-900">
                        Mercuriale marquée pour suppression
                      </p>
                      <p className="text-[11px] text-red-700 mt-0.5">
                        Le fichier sera retiré du site lors de l&apos;enregistrement des modifications.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsMercurialeRemoved(false)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-[#111111] hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Restaurer
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-[#C0392B] text-white text-xs font-semibold hover:bg-[#A93226] transition-colors cursor-pointer"
                    >
                      Remplacer par un nouveau PDF
                    </button>
                  </div>
                </div>
              ) : (
                /* CAS 4 : AUCUN FICHIER ACTUEL */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E8E4DF] bg-[#FAF8F6] hover:bg-white hover:border-[#C0392B]/60 rounded-2xl p-6 text-center cursor-pointer transition-all"
                >
                  <div className="w-12 h-12 mx-auto rounded-xl bg-white border border-[#E8E4DF] flex items-center justify-center text-[#C0392B] mb-2 shadow-2xs">
                    <UploadIcon size={20} />
                  </div>
                  <p className="text-xs font-bold text-[#111111]">
                    Cliquez ici pour téléverser le document PDF de la Mercuriale
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Format PDF uniquement · Taille maximale conseillée 25 Mo
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Métadonnées d'audit */}
          {settings?.updated_at && (
            <div className="flex items-center justify-between text-[0.6875rem] text-[#777777] px-1 font-mono">
              <span className="flex items-center gap-1.5">
                <ClockIcon size={12} />
                Dernière modification : {new Date(settings.updated_at).toLocaleString('fr-FR')}
              </span>
              <span>Modifié par : {settings.updated_by || 'Direction Générale'}</span>
            </div>
          )}
        </form>
      )}
    </div>
  )
}
