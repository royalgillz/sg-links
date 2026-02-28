import { useState, useEffect } from 'react'

const STORAGE_KEY = 'url_shortener_history'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function save(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useHistory() {
  const [history, setHistory] = useState(load)

  // Persist on every change
  useEffect(() => { save(history) }, [history])

  function addEntry(result) {
    setHistory(prev => {
      // Don't duplicate the same short code
      const filtered = prev.filter(h => h.shortCode !== result.shortCode)
      return [{ ...result, savedAt: new Date().toISOString() }, ...filtered].slice(0, 50)
    })
  }

  function removeEntry(shortCode) {
    setHistory(prev => prev.filter(h => h.shortCode !== shortCode))
  }

  function updateStats(shortCode, stats) {
    setHistory(prev =>
      prev.map(h => h.shortCode === shortCode ? { ...h, stats } : h)
    )
  }

  return { history, addEntry, removeEntry, updateStats }
}
