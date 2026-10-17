import RealisationsHero from '../../components/public/realisations/RealisationsHero'
import CaseStudies from '../../components/public/realisations/CaseStudies'

export default function Realisations() {
  return (
    <div className="flex flex-col">
      {/* React 19 Document Metadata */}
      <title>
        Nos Réalisations & Références | FL STRUCTURES - Déploiements miniers en Côte d'Ivoire
      </title>
      <meta
        name="description"
        content="Découvrez nos études de cas et déploiements logistiques sur bases-vie et sites miniers en Côte d'Ivoire : ravitaillement secteur Nord, maintien chaîne du froid secteur Sud."
      />

      {/* 1. Hero Réalisations */}
      <RealisationsHero />

      {/* 2. Études de cas (Cas 01 et Cas 02) */}
      <CaseStudies />

      {/* Aucun HomeCTA : la page se termine directement sur le Footer */}
    </div>
  )
}
