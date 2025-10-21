'use client'

import { useEffect, useState, useCallback } from 'react'

// 🔒 Global cache: persists as long as app session is active (no full page reload)
let globalUserCache: any = null
let globalAuthStatus: boolean | null = null

export function useAuthenticated() {
  const [authenticated, setAuthenticated] = useState<boolean>(globalAuthStatus ?? false)
  const [user, setUser] = useState<any>(globalUserCache)
  const [loading, setLoading] = useState<boolean>(!globalUserCache)

  // ✅ Helper: check cookie presence
  const isLoggedInCookiePresent = useCallback(() => {
    if (typeof document === 'undefined') return false
    return document.cookie
      .split(';')
      .map((c) => c.trim())
      .some((c) => c.startsWith('logged-in=true'))
  }, [])

  // ✅ Fetch /api/profile safely (with caching)
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/profile')

      if (!res.ok) {
        console.warn('Profile fetch failed:', res.status)
        globalUserCache = null
        globalAuthStatus = false
        setAuthenticated(false)
        setUser(null)
        return
      }

      const data = await res.json()
      globalUserCache = data
      globalAuthStatus = true
      setUser(data)
      setAuthenticated(true)
    } catch (err) {
      console.error('Error fetching profile:', err)
      globalUserCache = null
      globalAuthStatus = false
      setAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ Auto-detect login/logout cookie changes
  useEffect(() => {
    let previousCookie = document.cookie

    const interval = setInterval(() => {
      const currentCookie = document.cookie
      if (currentCookie !== previousCookie) {
        previousCookie = currentCookie

        const isLoggedIn = isLoggedInCookiePresent()

        if (!isLoggedIn && authenticated) {
          // Logged out → clear cache + state
          globalUserCache = null
          globalAuthStatus = false
          setAuthenticated(false)
          setUser(null)
        } else if (isLoggedIn && !authenticated) {
          // Logged in → refetch profile
          fetchProfile()
        }
      }
    }, 1500) // checks every 1.5 seconds (lightweight)

    return () => clearInterval(interval)
  }, [authenticated, fetchProfile, isLoggedInCookiePresent])

  // ✅ Initial load logic
  useEffect(() => {
    const loggedIn = isLoggedInCookiePresent()

    if (!loggedIn) {
      globalUserCache = null
      globalAuthStatus = false
      setAuthenticated(false)
      setUser(null)
      setLoading(false)
      return
    }

    if (globalUserCache) {
      // use cached user immediately
      setUser(globalUserCache)
      setAuthenticated(true)
      setLoading(false)
    } else {
      // first-time login in this session → fetch profile
      fetchProfile()
    }
  }, [fetchProfile, isLoggedInCookiePresent])

  // ✅ Optional manual refresh (e.g. after updating profile)
  const refreshProfile = useCallback(async () => {
    await fetchProfile()
  }, [fetchProfile])

  return { authenticated, user, loading, refreshProfile }
}
