import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Mail,
  Phone,
  Send,
  MapPin,
  Clock,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Building2,
  User,
  HelpCircle,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { sendContactMessage } from '../../services/api/contact.service'
import { getSettings } from '../../services/api/settings.service'
import siteConfig from '../../config/siteConfig'
import contactHeroImg from '../../assets/images/contact.jpg'
import { syncCrmMetrics } from '../../services/api/crmQuerySync'

const SUJETS_CONTACT = [
  'Demande de catalogue 2026',
  'Information générale',
  'Rendez-vous commercial',
  'Support technique',
  'Autre demande',
]

export default function ContactPage() {
  const queryClient = useQueryClient()

  // Paramètres dynamiques (Téléphone, Email, WhatsApp) issus de AlwaysData
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: getSettings,
    staleTime: 5 * 60 * 1000,
  })

  const displayPhone = settings?.telephone_principal || siteConfig?.phone || '+225 07 99 88 77 67'
  const displayEmail = settings?.email_reception_leads || siteConfig?.email || 'contact@fl-structures.ci'
  const cleanDigits = String(displayPhone).replace(/\D/g, '')
  const whatsappNumber = cleanDigits.startsWith('225') ? cleanDigits : '225' + cleanDigits
  const whatsappUrl = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent('Bonjour FL STRUCTURES, je souhaite des renseignements')
  const telUrl = 'tel:' + String(displayPhone).replace(/\s+/g, '')
  const [form, setForm] = useState({
    nom_contact: '',
    email: '',
    telephone: '',
    sujet: '',
    message: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Blocage physique de la frappe des lettres sur le champ téléphone
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
    // Permet uniquement chiffres, +, espaces, parenthèses, tirets et points
    if (!/[0-9+\s().-]/.test(e.key)) {
      e.preventDefault()
    }
  }

  const handlePhoneChange = (e) => {
    // Nettoyage additionnel contre le copier-coller contenant des lettres
    const cleaned = e.target.value.replace(/[^0-9+\s().-]/g, '')
    setForm((prev) => ({ ...prev, telephone: cleaned }))
    if (errors.telephone) setErrors((prev) => ({ ...prev, telephone: '' }))
  }

  const validate = () => {
    const newErrors = {}

    if (!form.nom_contact.trim()) {
      newErrors.nom_contact = 'Votre nom complet est requis'
    } else if (form.nom_contact.trim().length < 2) {
      newErrors.nom_contact = 'Le nom doit comporter au moins 2 caractères'
    }

    if (!form.email.trim()) {
      newErrors.email = 'L’email professionnel est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Adresse email invalide'
    }

    if (form.telephone && form.telephone.trim()) {
      const digits = form.telephone.replace(/\D/g, '')
      if (digits.length < 8) {
        newErrors.telephone = 'Le numéro de téléphone doit comporter au moins 8 chiffres'
      }
    }

    if (!form.sujet.trim()) {
      newErrors.sujet = 'Veuillez sélectionner ou préciser l’objet de votre demande'
    }

    if (!form.message.trim()) {
      newErrors.message = 'Veuillez rédiger votre message'
    } else if (form.message.trim().length < 5) {
      newErrors.message = 'Votre message doit comporter au moins 5 caractères'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Veuillez renseigner correctement les champs obligatoires (*).')
      return
    }

    setIsSubmitting(true)
    try {
      await sendContactMessage({
        nom_contact: form.nom_contact,
        email: form.email,
        telephone: form.telephone,
        sujet: form.sujet,
        message: form.message,
      })

      // Rafraîchissement instantané de toutes les métriques CRM et du Dashboard (0 ms)
      await syncCrmMetrics(queryClient)

      toast.success(
        'Votre message a été transmis avec succès. Notre équipe vous recontactera sous 24h.',
        {
          duration: 6000,
          icon: <CheckCircle2 className="text-emerald-600" size={18} />,
        }
      )

      setIsSuccess(true)
      setForm({
        nom_contact: '',
        email: '',
        telephone: '',
        sujet: '',
        message: '',
      })
      setErrors({})
    } catch (err) {
      console.error('Erreur soumission contact:', err)
      toast.error(
        err.response?.data?.message ||
          'Une erreur est survenue lors de l’envoi de votre message. Veuillez réessayer ou nous contacter par téléphone.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#FAF8F6] min-h-[85vh]">
      {/* React 19 Document Metadata */}
      <title>Contactez-nous & Devis Commercial | FL STRUCTURES</title>
      <meta
        name="description"
        content="Contactez nos équipes d'ingénierie et logistique pour vos structures modulaires, bases-vie et prestations industrielles en Côte d'Ivoire et Afrique de l'Ouest."
      />

      {/* 1. En-tête Hero */}
      <section className="relative bg-black text-white py-16 sm:py-24 overflow-hidden border-b border-[#333333] flex items-center">
        {/* Image de fond avec cadrage cinématique */}
        <img
          src={contactHeroImg}
          alt="FL STRUCTURES Logistique & Contact"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center brightness-[0.85] contrast-[1.05] pointer-events-none"
        />

        {/* Superposition sombre haut de gamme */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/85 pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs border border-white/15 mb-5">
              <ShieldCheck size={14} className="text-[#C0392B]" />
              <span>PÔLE RELATIONS CLIENTS & CONTACT COMMERCIAL</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Contactez nos équipes d&apos;ingénierie et logistique
            </h1>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed font-light">
              Une question sur nos structures modulaires, l&apos;avitaillement de bases-vie ou nos prestations industrielles ? Nos équipes vous répondent sous 24h.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Contenu principal : Mise en page 2 colonnes */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* ============================================================== */}
            {/* COLONNE GAUCHE (Formulaire de contact)                         */}
            {/* ============================================================== */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8E4DF] shadow-xs p-6 sm:p-10">
              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C0392B]">
                  Formulaire Direct
                </span>
                <h2 className="text-2xl font-bold text-[#111111] mt-1">
                  Envoyez-nous un message
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Renseignez vos coordonnées et votre besoin pour un traitement commercial prioritaire.
                </p>
              </div>

              {isSuccess && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Message transmis avec succès !</p>
                    <p className="text-emerald-700 text-xs mt-0.5">
                      Nos équipes d&apos;ingénierie commerciale ont bien reçu votre demande et reviendront vers vous sous 24h ouvrées.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Nom du contact */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                    Nom & Prénom <span className="text-[#C0392B]">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      name="nom_contact"
                      value={form.nom_contact}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, nom_contact: e.target.value }))
                        if (errors.nom_contact) setErrors((prev) => ({ ...prev, nom_contact: '' }))
                      }}
                      placeholder="Votre nom complet..."
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

                {/* Email & Téléphone (Grid 2 colonnes) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                      Email Professionnel <span className="text-[#C0392B]">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, email: e.target.value }))
                          if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                        }}
                        placeholder="nom@entreprise.com..."
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

                  {/* Téléphone (blocage physique des lettres) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                      Téléphone Direct <span className="text-gray-400 font-normal lowercase">(optionnel)</span>
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="tel"
                        name="telephone"
                        value={form.telephone}
                        onKeyDown={handlePhoneKeyDown}
                        onChange={handlePhoneChange}
                        placeholder="+225... / +221..."
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

                {/* Sujet */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                    Objet de votre Demande <span className="text-[#C0392B]">*</span>
                  </label>
                  <div className="relative">
                    <HelpCircle size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select
                      name="sujet"
                      value={form.sujet}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, sujet: e.target.value }))
                        if (errors.sujet) setErrors((prev) => ({ ...prev, sujet: '' }))
                      }}
                      className={`w-full h-11 pl-10 pr-8 text-xs sm:text-sm bg-[#FAF8F6] border rounded-xl text-[#111111] focus:outline-none focus:bg-white transition-all appearance-none cursor-pointer ${
                        errors.sujet
                          ? 'border-red-500 focus:border-red-500 ring-2 ring-red-100'
                          : 'border-[#E8E4DF] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15'
                      }`}
                      required
                    >
                      <option value="" disabled>Sélectionnez un sujet...</option>
                      {SUJETS_CONTACT.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      ▼
                    </div>
                  </div>
                  {errors.sujet && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{errors.sujet}</span>
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#333333] mb-1.5">
                    Votre Message <span className="text-[#C0392B]">*</span>
                  </label>
                  <textarea
                    rows={5}
                    name="message"
                    value={form.message}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, message: e.target.value }))
                      if (errors.message) setErrors((prev) => ({ ...prev, message: '' }))
                    }}
                    placeholder="Précisez votre besoin, localisation de chantier ou question..."
                    className={`w-full p-3.5 text-xs sm:text-sm bg-[#FAF8F6] border rounded-xl text-[#111111] placeholder-gray-400 focus:outline-none focus:bg-white transition-all resize-y ${
                      errors.message
                        ? 'border-red-500 focus:border-red-500 ring-2 ring-red-100'
                        : 'border-[#E8E4DF] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15'
                    }`}
                    required
                  />
                  {errors.message && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{errors.message}</span>
                    </p>
                  )}
                </div>

                {/* Bouton de soumission */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg hover:shadow-[#C0392B]/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Envoi de votre message en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>ENVOYER MON MESSAGE</span>
                        <Send size={16} />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-gray-500 text-center mt-3">
                    En soumettant ce formulaire, vous acceptez d&apos;être recontacté dans le cadre de votre projet industriel.
                  </p>
                </div>
              </form>
            </div>

            {/* ============================================================== */}
            {/* COLONNE DROITE (Coordonnées, Horaires, 3 Actions & Carte)      */}
            {/* ============================================================== */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* 3 BOUTONS D'ACTION DIRECTE (Grand format cliquable avec icônes) */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C0392B] block">
                  Lignes Directes
                </span>
                
                {/* 1. Appel Direct */}
                <a
                  href={telUrl}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#E8E4DF] shadow-xs hover:border-[#C0392B] hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-[#C0392B] flex items-center justify-center shrink-0 group-hover:bg-[#C0392B] group-hover:text-white transition-colors">
                    <Phone size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Appel Direct Commercial</p>
                    <p className="text-sm sm:text-base font-extrabold text-[#111111] font-mono tracking-tight group-hover:text-[#C0392B] transition-colors">
                      {displayPhone}
                    </p>
                  </div>
                </a>

                {/* 2. Email Direct */}
                <a
                  href={'mailto:' + displayEmail}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#E8E4DF] shadow-xs hover:border-[#C0392B] hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                    <Mail size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Email Officiel</p>
                    <p className="text-sm sm:text-base font-extrabold text-[#111111] group-hover:text-blue-700 transition-colors truncate">
                      {displayEmail}
                    </p>
                  </div>
                </a>

                {/* 3. WhatsApp Direct */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#E8E4DF] shadow-xs hover:border-emerald-600 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <MessageSquare size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">WhatsApp Dédié B2B</p>
                    <p className="text-sm sm:text-base font-extrabold text-[#111111] font-mono group-hover:text-emerald-700 transition-colors">
                      {displayPhone}
                    </p>
                  </div>
                </a>
              </div>

              {/* Boîte Horaires & Siège */}
              <div className="bg-white rounded-3xl border border-[#E8E4DF] shadow-xs p-6 sm:p-7 space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-[#111111] flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Siège Social & Plateforme Logistique</h3>
                    <p className="text-xs sm:text-sm font-semibold text-[#111111] mt-1">
                      Marcory Zone 4, Abidjan, Côte d&apos;Ivoire
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Interventions et déploiements sur sites miniers dans toute l&apos;Afrique de l&apos;Ouest.
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-[#111111] flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Horaires d&apos;ouverture</h3>
                    <p className="text-xs sm:text-sm font-medium text-[#111111] mt-1">
                      <span className="font-semibold">Lundi - Vendredi :</span> 07h30 - 18h00
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-[#111111]">
                      <span className="font-semibold">Samedi :</span> 08h00 - 12h30
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                      <span>Support urgence chantiers miniers 24h/7j</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARTE DE LOCALISATION OFFICIELLE */}
              <div className="bg-white rounded-3xl border border-[#E8E4DF] shadow-xs p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <MapPin size={16} className="text-[#C0392B]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    Localisation Officielle (Marcory Zone 4 - Abidjan)
                  </span>
                </div>
                <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-[#E8E4DF] bg-gray-100">
                  <iframe
                    title="Carte de localisation FL STRUCTURES Marcory Zone 4 Abidjan"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=-4.0050%2C5.2950%2C-3.9750%2C5.3150&layer=mapnik&marker=5.3030%2C-3.9900"
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-500 px-1">
                  <span>Accès aisé & proximité axes logistiques</span>
                  <a
                    href="https://www.openstreetmap.org/?mlat=5.3030&mlon=-3.9900#map=15/5.3030/-3.9900"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#C0392B] hover:underline font-semibold"
                  >
                    Agrandir le plan ↗
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
