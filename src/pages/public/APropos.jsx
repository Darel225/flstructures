import AboutHero from '../../components/public/about/AboutHero'
import AboutMission from '../../components/public/about/AboutMission'
import AboutValues from '../../components/public/about/AboutValues'
import AboutSecurity from '../../components/public/about/AboutSecurity'
import AboutCapabilities from '../../components/public/about/AboutCapabilities'
import AboutPartners from '../../components/public/about/AboutPartners'

export default function APropos() {
  return (
    <div className="flex flex-col">
      {/* React 19 Document Metadata */}
      <title>
        À propos | FL STRUCTURES - Logistique alimentaire pour sites miniers en Côte d'Ivoire
      </title>
      <meta
        name="description"
        content="Découvrez la mission, la vision et les valeurs de FL STRUCTURES, partenaire d'approvisionnement et de logistique alimentaire des sites miniers en Côte d'Ivoire."
      />

      <AboutHero />
      <AboutMission />
      <AboutValues />
      <AboutSecurity />
      <AboutCapabilities />
      <AboutPartners />
    </div>
  )
}
