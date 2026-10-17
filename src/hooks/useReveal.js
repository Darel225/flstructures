import { useEffect, useRef, useState } from 'react'

/**
 * Apparition au scroll, une seule fois.
 * - respecte prefers-reduced-motion (affiché directement)
 * - repli : affiche le contenu si l'observer ne se déclenche pas sous 1,5 s
 */
export default function useReveal({
  threshold = 0.15,
  rootMargin = '0px 0px -8% 0px',
} = {}) {
  const ref = useRef(null)
  const [prefersReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const [shown, setShown] = useState(
    () =>
      prefersReduced ||
      (typeof window !== 'undefined' && !('IntersectionObserver' in window))
  )

  useEffect(() => {
    if (prefersReduced) return
    const node = ref.current
    if (!node) return

    if (!('IntersectionObserver' in window)) {
      return
    }


    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )
    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [prefersReduced, threshold, rootMargin])

  return { ref, shown, prefersReduced }
}
