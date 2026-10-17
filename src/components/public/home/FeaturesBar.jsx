// CONTENU PROVISOIRE À VALIDER
import { Box, Handshake, ShieldCheck, Truck } from 'lucide-react'
import Reveal from '../../common/Reveal'

const FEATURES = [
  {
    icon: Box,
    title: 'GAMME COMPLÈTE',
    description:
      'Fourniture exhaustive en produits secs, frais et carnés, strictement adaptée aux exigences des bases-vie.',
    isGreen: false,
  },
  {
    icon: Truck,
    title: 'LOGISTIQUE SÉCURISÉE',
    description:
      "Acheminement ponctuel et maintien rigoureux de la chaîne du froid jusqu'aux zones d'extraction isolées.",
    isGreen: false,
  },
  {
    icon: ShieldCheck,
    title: 'QUALITÉ & CONFORMITÉ',
    description:
      'Traçabilité totale et respect intransigeant des normes sanitaires et phytosanitaires en vigueur.',
    isGreen: true,
  },
  {
    icon: Handshake,
    title: 'PARTENAIRE ÉPROUVÉ',
    description:
      "Une expertise de terrain et un accompagnement sur-mesure par des spécialistes de l'environnement minier.",
    isGreen: false,
  },
]

export default function FeaturesBar() {
  return (
    <section className="bg-white border-b border-gray-100 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-0 lg:divide-x lg:divide-gray-200/70">
          {FEATURES.map((item, i) => {
            const Icon = item.icon
            return (
              <Reveal
                key={item.title}
                delay={i * 140}
                distance={28}
                className="group flex flex-col items-start lg:px-7 first:lg:pl-0 last:lg:pr-0"
              >
                {/* Tuile d'icône ciselée et haut de gamme */}
                <div className="h-11 w-11 rounded-sm bg-brand-cream/80 border border-gray-200/80 flex items-center justify-center mb-5 shrink-0 shadow-2xs transition-all duration-300 group-hover:bg-white group-hover:border-gray-300 group-hover:shadow-md motion-safe:group-hover:-translate-y-0.5">
                  <Icon
                    strokeWidth={1.75}
                    className={`h-5 w-5 transition-transform duration-300 motion-safe:group-hover:scale-110 ${
                      item.isGreen ? 'text-brand-green' : 'text-brand-black'
                    }`}
                  />
                </div>

                {/* Titre ultra-précis en typographie fine et espacée */}
                <h3 className="font-heading font-bold text-[0.8125rem] tracking-[0.12em] text-brand-black uppercase mb-2.5 leading-snug">
                  {item.title}
                </h3>

                {/* Description aérée et élégante */}
                <p className="text-[0.8125rem] sm:text-[0.84375rem] text-gray-600 leading-[1.65] font-normal max-w-xs lg:max-w-none">
                  {item.description}
                </p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
