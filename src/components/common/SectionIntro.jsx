import useReveal from '../../hooks/useReveal'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

/**
 * En-tête de section animé, typographie alignée sur ServicesList / MethodSection :
 * surtitre rouge, titre gras, filet rouge qui se trace, sous-titre gris.
 */
export default function SectionIntro({
  overline,
  title,
  subtitle,
  align = 'center',
  withBar = true,
  titleClassName = 'font-heading font-bold text-[1.125rem] sm:text-[1.25rem] text-brand-black leading-snug',
  subtitleClassName = 'text-[0.8125rem] sm:text-[0.84375rem] text-gray-600 leading-[1.65] mt-3.5 max-w-2xl font-normal',
}) {
  const { ref, shown, prefersReduced } = useReveal({ threshold: 0.3 })
  const isCenter = align === 'center'

  const fade = (delay) =>
    prefersReduced
      ? undefined
      : {
          opacity: shown ? 1 : 0,
          transform: shown ? 'translateY(0)' : 'translateY(18px)',
          transition: `opacity 0.9s ${EASE} ${delay}ms, transform 1s ${EASE} ${delay}ms`,
        }

  return (
    <div
      ref={ref}
      className={`flex flex-col mb-8 md:mb-11 ${
        isCenter ? 'items-center text-center' : 'items-start text-left'
      }`}
    >
      {overline && (
        <div className="flex items-center gap-2 mb-2" style={fade(0)}>
          <span
            className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0"
            aria-hidden="true"
          />
          <span className="text-[0.6rem] font-heading font-bold uppercase tracking-[0.18em] text-brand-red">
            {overline}
          </span>
        </div>
      )}

      <h2
        className={titleClassName}
        style={fade(100)}
      >
        {title}
      </h2>

      {withBar && (
        <div
          className={`h-0.5 w-8 bg-brand-red mt-2 ${
            isCenter ? 'origin-center' : 'origin-left'
          }`}
          style={
            prefersReduced
              ? undefined
              : {
                  transform: shown ? 'scaleX(1)' : 'scaleX(0)',
                  transition: `transform 0.9s ${EASE} 350ms`,
                }
          }
          aria-hidden="true"
        />
      )}

      {subtitle && (
        <p
          className={subtitleClassName}
          style={fade(450)}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
