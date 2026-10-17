import HebergementHero from '../../components/public/hebergement/HebergementHero'
import HebergementPage from './HebergementPage'

export default function Hebergement() {
  return (
    <div className="flex flex-col">
      {/* React 19 Document Metadata */}
      <title>
        Hébergement Corporate & Résidences | FL STRUCTURES - Abidjan, Côte d'Ivoire
      </title>
      <meta
        name="description"
        content="Découvrez nos appartements et résidences d'affaires haut standing à Abidjan pour cadres et consultants : Plateau et Cocody Riviera Golf avec services hôteliers et sécurité 24/7."
      />

      {/* 1. Hero Hébergement Corporate */}
      <HebergementHero />

      {/* 2. Catalogue des résidences d'affaires connecté à l'API */}
      <HebergementPage />
    </div>
  )
}

