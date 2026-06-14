import { useState, useEffect } from 'react'

const STORAGE_KEY = 'sglinks_theme'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? stored === 'dark' : false // default to notebook (light)
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light')
    // let rough.js borders redraw with the new theme colors
    window.dispatchEvent(new Event('themechange'))
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)
  return { isDark, toggleTheme }
}
