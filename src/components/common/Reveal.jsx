import useReveal from '../../hooks/useReveal'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

/**
 * Enveloppe qui fait apparaître son contenu au scroll :
 * fondu + montée + léger défloutage, avec délai paramétrable.
 */
export default function Reveal({
  children,
  delay = 0,
  distance = 36,
  className = '',
  as: Tag = 'div',
  ...rest
}) {
  const { ref, shown, prefersReduced } = useReveal()

  return (
    <Tag
      ref={ref}
      className={className}
      style={
        prefersReduced
          ? undefined
          : {
              opacity: shown ? 1 : 0,
              transform: shown ? 'translateY(0)' : `translateY(${distance}px)`,
              filter: shown ? 'blur(0)' : 'blur(4px)',
              transition: `opacity 1s ${EASE} ${delay}ms, transform 1.1s ${EASE} ${delay}ms, filter 0.9s ${EASE} ${delay}ms`,
            }
      }
      {...rest}
    >
      {children}
    </Tag>
  )
}
