import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ShieldCheck,
  Building2,
  Scale,
  Lock,
  FileText,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from 'lucide-react'
import { getSettings } from '../../services/api/settings.service'
import siteConfig from '../../config/siteConfig'

export default function MentionsLegales() {
  const currentYear = new Date().getFullYear()

  // Récupération dynamique de l'email et du téléphone configurés
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: getSettings,
    staleTime: 5 * 60 * 1000,
  })

  const displayEmail = settings?.email_reception_leads || siteConfig?.email || 'contact@fl-structures.ci'
  const displayPhone = settings?.telephone_principal || siteConfig?.phone || '+225 07 99 88 77 68'

  return (
    <div className="bg-[#FAF8F6] min-h-screen">
      {/* React 19 Document Metadata */}
      <title>Mentions Légales & Confidentialité | FL STRUCTURES</title>
      <meta
        name="description"
        content="Informations légales, politique de confidentialité des données et engagements de conformité réglementaire de FL STRUCTURES en Côte d'Ivoire."
      />

      {/* HERO SECTION */}
      <section className="relative bg-brand-black text-white py-16 md:py-24 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-linear-to-r from-black via-brand-black to-black/80 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-red/15 blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs font-semibold uppercase tracking-wider backdrop-blur-md mb-6">
            <Scale size={14} className="text-brand-red" />
            <span>Cadre Juridique & Conformité Réglementaire</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-white leading-tight">
            Mentions Légales & Confidentialité
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-300 leading-relaxed font-normal max-w-2xl">
            Transparence, conformité aux normes ivoiriennes et protection rigoureuse de vos données professionnelles et mercuriales d&apos;approvisionnement.
          </p>
          <div className="mt-6 flex items-center gap-3 text-xs text-gray-400">
            <span>Dernière mise à jour : Octobre {currentYear}</span>
            <span>•</span>
            <span>République de Côte d&apos;Ivoire</span>
          </div>
        </div>
      </section>

      {/* CORPS DE PAGE */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">

        {/* SECTION 01 : ÉDITEUR DU SITE */}
        <section className="bg-white rounded-3xl border border-[#E8E4DF] shadow-xs p-7 sm:p-9 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-brand-red flex items-center justify-center shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-red block">Section 01</span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-brand-black">
                Éditeur de la Plateforme
              </h2>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            Le présent site internet accessible à l&apos;adresse officielle de <strong className="text-brand-black">FL STRUCTURES</strong> est édité et exploité par la société :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-gray-200/80 space-y-2">
              <div className="flex items-start gap-2.5">
                <Building2 size={16} className="text-brand-red shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-brand-black block">Raison Sociale :</span>
                  <span className="text-gray-600">FL STRUCTURES SARL</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 pt-2 border-t border-gray-200/60">
                <MapPin size={16} className="text-brand-red shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-brand-black block">Siège Social & Plateforme :</span>
                  <span className="text-gray-600">Marcory Zone 4, Abidjan, Côte d&apos;Ivoire</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-gray-200/80 space-y-2">
              <div className="flex items-start gap-2.5">
                <Phone size={16} className="text-brand-red shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-brand-black block">Ligne Téléphonique Directe :</span>
                  <a href={`tel:${displayPhone.replace(/\s+/g, '')}`} className="text-gray-700 hover:text-brand-red font-medium">
                    {displayPhone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2.5 pt-2 border-t border-gray-200/60">
                <Mail size={16} className="text-brand-red shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-bold text-brand-black block">Courriel de Contact Officiel :</span>
                  <a href={`mailto:${displayEmail}`} className="text-brand-red hover:underline font-semibold truncate block">
                    {displayEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
            <strong>Objet Social & Cœur de Métier :</strong> Approvisionnement alimentaire, centrale de sourcing B2B, gestion des stocks récurrents et coordination logistique sécurisée sous température dirigée à destination des entreprises minières et des sociétés de restauration collective en Côte d&apos;Ivoire.
          </div>
        </section>

        {/* SECTION 02 : PROTECTION DES DONNÉES & CONFIDENTIALITÉ (ARTCI) */}
        <section className="bg-white rounded-3xl border border-[#E8E4DF] shadow-xs p-7 sm:p-9 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">Section 02</span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-brand-black">
                Protection des Données & Confidentialité
              </h2>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            Conformément aux dispositions de la <strong className="text-brand-black">Loi n° 2013-450 du 19 juin 2013</strong> relative à la protection des données à caractère personnel en République de Côte d&apos;Ivoire, FL STRUCTURES s&apos;engage à préserver la stricte confidentialité des données transmises par ses clients, partenaires et prospects.
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-gray-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-black mb-1.5">
                A. Finalités de la collecte
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Les informations recueillies via les formulaires de devis, d&apos;agrément fournisseur ou de contact (raison sociale, noms des référents, coordonnées téléphoniques, adresses e-mail, localisation des chantiers) sont exclusivement utilisées pour l&apos;établissement de propositions tarifaires, la gestion des mercuriales et la coordination des livraisons logistiques.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-gray-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-black mb-1.5">
                B. Confidentialité absolue des Mercuriales & Pièces jointes
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Les documents techniques, grilles tarifaires internes et mercuriales transmis par nos clients miniers et de restauration collective demeurent leur propriété exclusive et ne font l&apos;objet d&apos;aucune cession, revente ou divulgation à des tiers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-gray-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-black mb-1.5">
                C. Droits d&apos;accès, de rectification et d&apos;opposition
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Tout interlocuteur dispose d&apos;un droit d&apos;accès, de mise à jour ou de suppression de ses données professionnelles sur simple demande écrite adressée à : <a href={`mailto:${displayEmail}`} className="text-brand-red font-semibold hover:underline">{displayEmail}</a>.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 03 : CONFORMITÉ SANITAIRE & NORMES ALIMENTAIRES */}
        <section className="bg-white rounded-3xl border border-[#E8E4DF] shadow-xs p-7 sm:p-9 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-brand-red flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-red block">Section 03</span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-brand-black">
                Engagements Sanitaires, HACCP & Chaîne du Froid
              </h2>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            L&apos;approvisionnement de sites miniers et de cantines collectives obéit à des normes strictes de salubrité publique et de sécurité sanitaire des denrées :
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-gray-200 space-y-1.5">
              <span className="font-bold text-brand-black block">Températures Dirigées Strictes :</span>
              <p className="text-gray-600 leading-relaxed">
                Respect ininterrompu de la chaîne du froid (-25°C pour les surgelés/carnés, +2°C à +4°C pour les produits frais et crèmerie).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-gray-200 space-y-1.5">
              <span className="font-bold text-brand-black block">Traçabilité Documentaire :</span>
              <p className="text-gray-600 leading-relaxed">
                Contrôles systématiques à réception, certificats sanitaires d&apos;abattage et fiches de relevé thermique remises à chaque convoi.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 04 : PROPRIÉTÉ INTELLECTUELLE */}
        <section className="bg-white rounded-3xl border border-[#E8E4DF] shadow-xs p-7 sm:p-9 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-brand-black flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Section 04</span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-brand-black">
                Propriété Intellectuelle
              </h2>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            L&apos;ensemble des contenus présents sur cette plateforme (textes, logos, photographies d&apos;entrepôts et convois, graphismes, iconographies et charte visuelle) sont la propriété exclusive de <strong className="text-brand-black">FL STRUCTURES</strong> ou de ses partenaires. Toute reproduction, représentation, modification ou diffusion totale ou partielle, sans autorisation préalable écrite, est strictement interdite.
          </p>
        </section>

        {/* BANDEAU CONTACT SUPPORT */}
        <div className="bg-linear-to-r from-brand-black to-[#222222] text-white rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-heading font-bold text-white">Une question sur nos engagements de conformité ?</h3>
            <p className="text-xs sm:text-sm text-gray-300">Notre équipe commerciale et juridique est à votre écoute.</p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white text-xs font-heading font-bold uppercase tracking-wider transition-colors shrink-0"
          >
            <span>Contacter notre équipe</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  )
}
