import ServicesHero from '../../components/public/services/ServicesHero'
import ServicesList from '../../components/public/services/ServicesList'
import MethodSection from '../../components/public/home/MethodSection'
import HomeCTA from '../../components/public/home/HomeCTA'

export default function Services() {
  return (
    <div className="flex flex-col">
      {/* React 19 Document Metadata */}
      <title>
        Nos Services Logistiques | FL STRUCTURES - Approvisionnement minier en Côte d'Ivoire
      </title>
      <meta
        name="description"
        content="Découvrez nos solutions complètes et sur mesure pour l'approvisionnement de vos sites miniers : sourcing selon mercuriale, chaîne logistique sécurisée, gestion des stocks et traçabilité."
      />

      {/* 1. Hero des services */}
      <ServicesHero />

      {/* 2. Liste des 5 services en zig-zag */}
      <ServicesList />

      {/* 3. Section Notre Méthode (réutilisation conforme) */}
      <MethodSection
        overline="NOTRE MÉTHODE"
        title="Exécution Logistique & Qualité"
        subtitle="Une approche rigoureuse en 6 étapes pour sécuriser et fluidifier vos approvisionnements en Côte d'Ivoire."
      />

      {/* 4. Section CTA final (réutilisation conforme) */}
      <HomeCTA
        overline="PARTENARIAT STRATÉGIQUE B2B"
        title="Prêt à sécuriser vos approvisionnements miniers ?"
        subtitle="Échangeons sur vos exigences d'approvisionnement et vos plannings de rotations. Réponse réactive sous 48h ouvrées."
        buttonText="DEMANDER UN DEVIS"
        link="/contact"
      />
    </div>
  )
}
