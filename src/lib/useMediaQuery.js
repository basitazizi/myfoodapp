import { useEffect, useState } from 'react'

export function useMediaQuery(query) {
  const getMatches = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState(getMatches)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia(query)

    const onChange = (e) => setMatches(e.matches)
    setMatches(mql.matches)

    // Safari < 14 uses addListener/removeListener.
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    }

    mql.addListener(onChange)
    return () => mql.removeListener(onChange)
  }, [query])

  return matches
}

