// CONTENU PROVISOIRE À VALIDER
import { AlertTriangle, Check, CheckCircle2, Snowflake } from 'lucide-react'
import ButtonLink from '../../common/ButtonLink'
import SectionIntro from '../../common/SectionIntro'
import Reveal from '../../common/Reveal'
import imgRealisation from '../../../assets/images/expertise-logistique2.jpg'

const REALISATION_DATA = {
  badge: "Opération terrain • Côte d'Ivoire",
  zoneTag: 'ZONE ÉLOIGNÉE',
  zoneDesc: 'Acheminement sous température dirigée vers les bases-vie',
  overline: "EXEMPLE D'INTERVENTION",
  title: 'Sécurisation de la chaîne du froid en zone isolée',
  items: [
    {
      label: 'Le Besoin :',
      text: 'Maintenir rigoureusement la chaîne du froid afin de préserver la qualité et la fraîcheur des denrées périssables.',
      icon: Snowflake,
      isGreen: false,
    },
    {
      label: 'La Contrainte :',
      text: 'Faire face aux accès routiers complexes et aux conditions climatiques extrêmes pouvant affecter le transport des marchandises.',
      icon: AlertTriangle,
      isGreen: false,
    },
    {
      label: 'La Solution :',
      text: 'Déployer une flotte frigorifique adaptée et planifier rigoureusement les rotations pour garantir des livraisons fiables et sécurisées.',
      icon: CheckCircle2,
      isGreen: true,
    },
  ],
  cta: 'DÉCOUVRIR NOS MISSIONS',
}

export default function HomeRealisations() {
  return (
    <section className="bg-brand-cream py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionIntro
          align="center"
          withBar={true}
          overline="EXPÉRIENCE & RIGUEUR"
          title="NOS RÉALISATIONS"
          subtitle="Des projets concrets et des solutions efficaces, adaptés aux réalités du terrain."
          titleClassName="font-heading font-extrabold text-[1.25rem] sm:text-[1.4rem] md:text-[1.55rem] text-brand-black leading-snug tracking-tight"
          subtitleClassName="text-[0.875rem] sm:text-[0.9375rem] md:text-[1rem] text-gray-600 leading-relaxed mt-3.5 max-w-2xl font-normal"
        />

        <Reveal
          distance={48}
          className="mt-12 overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-200/80 hover:shadow-2xl transition-shadow duration-500 grid grid-cols-1 lg:grid-cols-2 group"
        >
          {/* Côté image avec positionnement cinématographique et zoom doux */}
          <div className="relative min-h-[340px] sm:min-h-[380px] lg:min-h-[480px] overflow-hidden bg-brand-black">
            <img
              src={imgRealisation}
              alt="Convoi logistique FL STRUCTURES sous température dirigée vers un site minier isolé"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[center_65%] transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03]"
            />

            {/* Pastille haut de gamme en haut à gauche avec balise statut */}
            <div className="absolute top-5 left-5 inline-flex items-center gap-1.5 bg-black/65 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white font-heading text-[0.65rem] font-bold uppercase tracking-[0.16em] shadow-md">
              <Check strokeWidth={2.5} className="h-3.5 w-3.5 text-brand-green shrink-0" />
              <span>{REALISATION_DATA.badge}</span>
            </div>

            {/* Légende en bas sur dégradé sombre progressif */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 bg-linear-to-t from-black/95 via-black/65 via-50% to-transparent text-white">
              <div className="inline-flex items-center gap-2 mb-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0" />
                <span className="font-heading font-bold text-[0.6875rem] uppercase tracking-[0.18em] text-white">
                  {REALISATION_DATA.zoneTag}
                </span>
              </div>
              <p className="text-[0.8125rem] text-white/85 leading-relaxed font-normal max-w-sm">
                {REALISATION_DATA.zoneDesc}
              </p>
            </div>
          </div>

          {/* Côté texte structuré en briefing de mission haut de gamme */}
          <div className="p-8 sm:p-10 lg:p-12 xl:p-14 flex flex-col justify-between bg-white">
            <div>
              <div className="inline-flex items-center gap-2 font-heading text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-brand-red mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0" />
                <span>{REALISATION_DATA.overline}</span>
              </div>

              <h3 className="font-heading font-extrabold text-[1.35rem] md:text-[1.55rem] text-brand-black mb-7 leading-tight tracking-tight">
                {REALISATION_DATA.title}
              </h3>

              <div className="space-y-4 sm:space-y-5">
                {REALISATION_DATA.items.map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <Reveal
                      key={item.label}
                      delay={idx * 140}
                      distance={24}
                      className="group/item flex items-start gap-4 p-3 -mx-3 rounded-lg hover:bg-brand-cream/50 transition-colors duration-200 border-b border-gray-100/80 last:border-b-0 pb-4 last:pb-3"
                    >
                      <div
                        className={`h-10 w-10 rounded-sm flex items-center justify-center shrink-0 border transition-all duration-200 ${item.isGreen
                          ? 'bg-brand-green/15 text-brand-green border-brand-green/30 group-hover/item:bg-brand-green/20'
                          : 'bg-brand-red/10 text-brand-red border-brand-red/20 group-hover/item:bg-brand-red/15'
                          }`}
                      >
                        <Icon strokeWidth={2} className="h-5 w-5" />
                      </div>
                      <div className="leading-relaxed">
                        <span className="font-heading font-bold text-[0.8125rem] tracking-[0.06em] uppercase text-brand-black block mb-1">
                          {item.label}
                        </span>
                        <p className="text-[0.8125rem] sm:text-[0.84375rem] text-gray-600 leading-[1.65] font-normal">
                          {item.text}
                        </p>
                      </div>
                    </Reveal>
                  )
                })}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-gray-100/80 flex items-center justify-start">
              <ButtonLink
                to="/realisations"
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
              >
                {REALISATION_DATA.cta}
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
