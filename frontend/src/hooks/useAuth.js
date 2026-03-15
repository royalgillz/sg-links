import { useState, useCallback } from 'react'

const TOKEN_KEY = 'url_shortener_token'
const USER_KEY = 'url_shortener_user'

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })

  const login = useCallback((authResponse) => {
    localStorage.setItem(TOKEN_KEY, authResponse.token)
    localStorage.setItem(USER_KEY, JSON.stringify({ username: authResponse.username, email: authResponse.email, role: authResponse.role }))
    setToken(authResponse.token)
    setUser({ username: authResponse.username, email: authResponse.email, role: authResponse.role })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  // Call this after any fetch that returns 401 to clear a stale/expired token
  const clearIfExpired = useCallback((status) => {
    if (status === 401) logout()
  }, [logout])

  return { token, user, login, logout, clearIfExpired, isLoggedIn: !!token }
}
