import { Link } from 'react-router-dom'
import {
  ChevronRight,
  Download,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import logo from '../../assets/images/logo.png'
import siteConfig from '../../config/siteConfig'
import { getSettings, getMercurialeUrl } from '../../services/api/settings.service'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: getSettings,
    staleTime: 5 * 60 * 1000,
  })

  const mercurialeUrl = settings?.fichier_mercuriale_globale
    ? getMercurialeUrl(settings.fichier_mercuriale_globale)
    : siteConfig.mercurialeUrl

  const displayPhone = settings?.telephone_principal || siteConfig.phone
  const displayEmail = settings?.email_reception_leads || siteConfig.email

  return (
    <footer className="bg-brand-black text-gray-300 relative border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Colonne 1 : Présentation & Identité */}
          <div className="space-y-5">
            {/* Logo dans conteneur ciselé avec fond clair et bordure fine */}
            <div className="inline-flex items-center bg-white rounded-lg p-2.5 border border-white/10 shadow-sm transition-transform duration-200 motion-safe:hover:scale-[1.02]">
              <img
                src={logo}
                alt="FL STRUCTURES"
                className="h-9 w-auto object-contain"
              />
            </div>

            <p className="text-[0.84rem] leading-[1.7] text-gray-400 font-normal max-w-xs">
              Logistique alimentaire de haute fiabilité pour les sites miniers et
              environnements isolés en Côte d'Ivoire.
            </p>

            {/* Badge capsule de statut opérationnel */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 font-heading text-[0.625rem] font-bold uppercase tracking-[0.16em]">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-green shrink-0 shadow-[0_0_8px_rgba(139,195,74,0.8)] animate-pulse" />
              <span className="text-brand-green font-semibold">
                CONTINUITÉ D'APPROVISIONNEMENT
              </span>
            </div>
          </div>

          {/* Colonne 2 : Liens Rapides */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0" />
              <h3 className="font-heading text-[0.75rem] font-bold uppercase tracking-[0.18em] text-white">
                LIENS RAPIDES
              </h3>
            </div>

            <ul className="space-y-3">
              {[
                { to: '/a-propos', label: 'À propos' },
                { to: '/services', label: 'Nos services' },
                { to: '/produits', label: 'Nos produits' },
                { to: '/hebergement', label: 'Hébergement corporate' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="group inline-flex items-center gap-2 text-[0.84rem] text-gray-400 hover:text-white transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded-xs"
                  >
                    <span className="h-px w-2 bg-brand-red/60 transition-all duration-200 group-hover:w-3.5 group-hover:bg-brand-red" />
                    <span className="transition-transform duration-200 motion-safe:group-hover:translate-x-0.5">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 : Opérations */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0" />
              <h3 className="font-heading text-[0.75rem] font-bold uppercase tracking-[0.18em] text-white">
                OPÉRATIONS
              </h3>
            </div>

            <ul className="space-y-3.5">
              {/* Localisation */}
              <li className="flex items-center gap-3 group">
                <div className="h-8 w-8 rounded-sm bg-white/5 border border-white/10 text-brand-red flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:border-brand-red/30 group-hover:bg-brand-red/10">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span className="text-[0.84rem] text-gray-300">
                  {siteConfig.location}
                </span>
              </li>

              {/* Email / Demande d'informations */}
              <li className="flex items-center gap-3 group">
                <div className="h-8 w-8 rounded-sm bg-white/5 border border-white/10 text-brand-red flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:border-brand-red/30 group-hover:bg-brand-red/10">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                {displayEmail ? (
                  <a
                    href={`mailto:${displayEmail}`}
                    className="text-[0.84rem] text-gray-400 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded-xs"
                  >
                    Demande d'informations
                  </a>
                ) : (
                  <Link
                    to="/contact"
                    className="text-[0.84rem] text-gray-400 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded-xs"
                  >
                    Demande d'informations
                  </Link>
                )}
              </li>

              {/* Téléphone (affiché si configuré) */}
              {displayPhone && (
                <li className="flex items-center gap-3 group">
                  <div className="h-8 w-8 rounded-sm bg-white/5 border border-white/10 text-brand-red flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:border-brand-red/30 group-hover:bg-brand-red/10">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  <a
                    href={`tel:${displayPhone.split('/')[0].trim()}`}
                    className="text-[0.84rem] text-gray-400 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded-xs"
                  >
                    {displayPhone}
                  </a>
                </li>
              )}

              {/* WhatsApp (affiché seulement si configuré) */}
              {siteConfig.whatsapp && (
                <li className="flex items-center gap-3 group">
                  <div className="h-8 w-8 rounded-sm bg-white/5 border border-white/10 text-brand-red flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:border-brand-red/30 group-hover:bg-brand-red/10">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </div>
                  <a
                    href={`https://wa.me/${siteConfig.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.84rem] text-gray-400 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded-xs"
                  >
                    Assistance WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Colonne 4 : Agrément */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0" />
              <h3 className="font-heading text-[0.75rem] font-bold uppercase tracking-[0.18em] text-white">
                AGRÉMENT
              </h3>
            </div>

            <ul className="space-y-3 mb-6">
              {[
                { to: '/devenir-partenaire', label: 'Espace Fournisseur' },
                { to: '/mentions-legales', label: 'Documentation légale' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="group inline-flex items-center gap-2 text-[0.84rem] text-gray-400 hover:text-white transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded-xs"
                  >
                    <span className="h-px w-2 bg-brand-red/60 transition-all duration-200 group-hover:w-3.5 group-hover:bg-brand-red" />
                    <span className="transition-transform duration-200 motion-safe:group-hover:translate-x-0.5">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <span className="text-[0.65rem] font-heading font-semibold uppercase tracking-[0.16em] text-gray-500 block mb-2">
                DOSSIER AGRÉMENT
              </span>
              {mercurialeUrl ? (
                <a
                  href={mercurialeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/10 hover:border-brand-red/40 hover:bg-white/[0.06] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-sm bg-brand-red/15 text-brand-red flex items-center justify-center shrink-0 group-hover:bg-brand-red group-hover:text-white transition-colors duration-200">
                      <Download className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-[0.78rem] font-heading font-bold text-white block leading-snug">
                        Mercuriale B2B
                      </span>
                      <span className="text-[0.6875rem] text-gray-400 block font-normal leading-none mt-0.5">
                        Catalogue & mercuriales
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-500 group-hover:text-brand-red group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                </a>
              ) : (
                <Link
                  to="/devenir-partenaire"
                  className="group flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/10 hover:border-brand-red/40 hover:bg-white/[0.06] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-sm bg-brand-red/15 text-brand-red flex items-center justify-center shrink-0 group-hover:bg-brand-red group-hover:text-white transition-colors duration-200">
                      <Download className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-[0.78rem] font-heading font-bold text-white block leading-snug">
                        Mercuriale B2B
                      </span>
                      <span className="text-[0.6875rem] text-gray-400 block font-normal leading-none mt-0.5">
                        Catalogue & mercuriales
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-500 group-hover:text-brand-red group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Barre inférieure sobre et ciselée */}
        <div className="pt-8 mt-14 border-t border-white/10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-[0.78rem] text-gray-400 font-normal">
          <p>© {currentYear} FL STRUCTURES. Tous droits réservés.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/mentions-legales"
              className="hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded-xs"
            >
              Mentions légales & Confidentialité
            </Link>
            <span className="text-white/20 select-none">•</span>
            <span className="inline-flex items-center gap-1.5 text-gray-400">
              <span className="h-1 w-1 rounded-full bg-brand-red shrink-0" />
              <span>Côte d'Ivoire · B2B Mines</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
