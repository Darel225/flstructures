import ExpertiseSection from '../../components/public/home/ExpertiseSection'
import FeaturesBar from '../../components/public/home/FeaturesBar'
import HeroSection from '../../components/public/home/HeroSection'
import HomeCTA from '../../components/public/home/HomeCTA'
import HomeRealisations from '../../components/public/home/HomeRealisations'
import MethodSection from '../../components/public/home/MethodSection'

export default function Accueil() {
  return (
    <div className="flex flex-col">
      {/* React 19 Document Metadata */}
      <title>
        FL STRUCTURES | Approvisionnement et logistique alimentaire pour sites
        miniers en Côte d'Ivoire
      </title>
      <meta
        name="description"
        content="FL STRUCTURES assure l'approvisionnement alimentaire et la logistique de livraison pour les sites miniers en Côte d'Ivoire : produits, qualité, ponctualité."
      />

      <HeroSection />
      <FeaturesBar />
      <ExpertiseSection />
      <MethodSection />
      <HomeRealisations />
      <HomeCTA titleSize="large" />
    </div>
  )
}
