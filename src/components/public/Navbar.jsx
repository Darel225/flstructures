import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import ButtonLink from '../common/ButtonLink'
import { useDevisModal } from '../../store/devisModalStore'
import logo from '../../assets/images/logo.png'

const NAV_LINKS = [
  { name: 'ACCUEIL', path: '/' },
  { name: 'À PROPOS', path: '/a-propos' },
  { name: 'NOS SERVICES', path: '/services' },
  { name: 'NOS PRODUITS', path: '/produits' },
  { name: 'RÉALISATIONS', path: '/realisations' },
  { name: 'HÉBERGEMENT', path: '/hebergement' },
]

export default function Navbar() {
  const { openDevisModal } = useDevisModal()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  // Fermeture du menu mobile à chaque changement de route (useLocation + useEffect)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false)
  }, [location.pathname])

  // Détection du scroll passif (> 24px)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = () => setIsOpen(false)

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Ligne haute */}
      <div
        className={`bg-brand-cream border-b border-gray-200 transition-all duration-200 ${
          scrolled ? 'py-1.5 shadow-sm' : 'py-2.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            aria-label="FL STRUCTURES - Accueil"
            className="flex items-center shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded-sm"
          >
            <img
              src={logo}
              alt="FL STRUCTURES"
              className={`w-auto object-contain transition-all duration-200 ${
                scrolled ? 'h-8' : 'h-9 md:h-10'
              }`}
            />
          </Link>

          {/* Desktop : Sélecteur FR | EN + CTA */}
          <div className="hidden md:flex items-center gap-6">
            {/* Sélecteur de langue */}
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {/* TODO i18n */}
              <button
                type="button"
                className="text-brand-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded-sm px-1 py-0.5"
                aria-label="Changer la langue en Français"
              >
                FR
              </button>
              <span className="text-gray-400 select-none">|</span>
              <button
                type="button"
                className="text-gray-500 hover:text-brand-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded-sm px-1 py-0.5"
                aria-label="Switch language to English"
              >
                EN
              </button>
            </div>

            {/* CTA Contact ButtonLink size="sm" */}
            <ButtonLink to="/contact" variant="primary" size="sm">
              CONTACT
            </ButtonLink>
          </div>

          {/* Mobile (< md) : CTA compact + Burger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => openDevisModal()}
              className="h-9 px-3.5 text-[0.72rem] font-heading font-bold uppercase tracking-wider text-white bg-brand-red hover:bg-brand-red-dark rounded-md transition-colors cursor-pointer"
            >
              DEVIS
            </button>

            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-nav-panel"
              className="p-1.5 text-brand-black hover:text-brand-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded-sm transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Ligne basse (visible à partir de md) */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Navigation principale"
            className="flex justify-center items-center gap-8 lg:gap-12"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `font-heading font-bold text-[0.78rem] tracking-[0.08em] uppercase py-3 border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red ${
                    isActive
                      ? 'text-brand-red border-brand-red'
                      : 'text-brand-black border-transparent hover:text-brand-red'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Panneau déroulant mobile */}
      {isOpen && (
        <div
          id="mobile-nav-panel"
          className="md:hidden bg-white border-b border-gray-200 shadow-lg px-4 py-3 space-y-1"
        >
          <nav aria-label="Navigation mobile" className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `min-h-11 flex items-center px-3 font-heading font-bold text-[0.78rem] tracking-[0.08em] uppercase rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red ${
                    isActive
                      ? 'text-brand-red bg-brand-cream/60'
                      : 'text-brand-black hover:bg-gray-50 hover:text-brand-red'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <NavLink
              to="/contact"
              onClick={closeMenu}
              className={({ isActive }) =>
                `min-h-11 flex items-center px-3 font-heading font-bold text-[0.78rem] tracking-[0.08em] uppercase rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red ${
                  isActive
                    ? 'text-brand-red bg-brand-cream/60'
                    : 'text-brand-black hover:bg-gray-50 hover:text-brand-red'
                }`
              }
            >
              CONTACT
            </NavLink>
          </nav>

          {/* Sélecteur FR | EN Mobile */}
          <div className="pt-3 pb-1 border-t border-gray-200 flex items-center justify-center gap-3 text-xs font-semibold">
            {/* TODO i18n */}
            <button
              type="button"
              className="text-brand-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded-sm px-2 py-1 min-h-11"
              aria-label="Changer la langue en Français"
            >
              FR
            </button>
            <span className="text-gray-400 select-none">|</span>
            <button
              type="button"
              className="text-gray-500 hover:text-brand-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded-sm px-2 py-1 min-h-11"
              aria-label="Switch language to English"
            >
              EN
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
