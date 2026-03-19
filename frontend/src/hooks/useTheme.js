import { useState, useEffect } from 'react'

const STORAGE_KEY = 'url_shortener_theme'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? stored === 'dark' : true // default dark
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)
  return { isDark, toggleTheme }
}
