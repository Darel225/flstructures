import ProductsHero from '../../components/public/products/ProductsHero'
import ProductsCategories from '../../components/public/products/ProductsCategories'
import HomeCTA from '../../components/public/home/HomeCTA'

export default function Produits() {
  return (
    <div className="flex flex-col">
      {/* React 19 Document Metadata */}
      <title>
        Catalogue & Produits | FL STRUCTURES - Approvisionnement minier en Côte d'Ivoire
      </title>
      <meta
        name="description"
        content="Découvrez notre gamme complète d'approvisionnement B2B pour sites miniers : vivres frais, secs, surgelés, boissons, entretien et références sur mesure."
      />

      {/* 1. Hero Catalogue & Produits */}
      <ProductsHero />

      {/* 2. Grille des 6 catégories d'approvisionnement */}
      <ProductsCategories />

      {/* 3. Section CTA final adaptée à la maquette */}
      <HomeCTA
        bgClass="bg-[#F8F6F4]"
        pill={true}
        overline="ACCOMPAGNEMENT SUR MESURE"
        title="Prêt à sécuriser vos approvisionnements miniers ?"
        subtitle="Échangeons sur vos enjeux logistiques pour définir l'offre B2B la plus adaptée à votre base-vie."
        buttonText="DEMANDER UN DEVIS"
        link="/contact"
        withBar={false}
        titleSize="large"
      />
    </div>
  )
}
