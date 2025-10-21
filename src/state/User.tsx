'use client'

import { useAuthenticated } from '@/hooks/useAuthentication'
import { isVariableValid } from '@/lib/utils'
import React, { createContext, useContext, useEffect, useState } from 'react'

const UserContext = createContext({
  user: null,
  loading: true,
  refreshUser: async () => { },
})

export const useUserContext = () => useContext(UserContext)

export const UserContextProvider = ({ children }) => {
  const { authenticated } = useAuthenticated()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Utility: store userId safely
  const safeSetUserId = (id) => {
    if (typeof window === 'undefined') return
    if (id) {
      localStorage.setItem('userId', id)
      console.log('%c[UserContext] ✅ userId stored in localStorage:', 'color: #00c853;', id)
    }
  }

  const safeRemoveUserId = () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('userId')
    console.log('%c[UserContext] ❌ userId removed from localStorage', 'color: #ff5252;')
  }

  const logResponse = async (response) => {
    const clone = response.clone()
    const text = await clone.text()
    console.log('%c[UserContext] 🛰 /api/profile Response:', 'color: #64b5f6;', {
      status: response.status,
      ok: response.ok,
      body: text,
    })
    return response
  }

  const handleProfile = async (response) => {
    const loggedResponse = await logResponse(response)
    if (!loggedResponse.ok) {
      console.log('[UserContext] ❌ Profile fetch failed, clearing user data.')
      safeRemoveUserId()
      setUser(null)
      setLoading(false)
      return
    }


    let json: any = {}
    try {
      json = await loggedResponse.json()
    } catch (err) {
      console.error('[UserContext] ⚠️ Failed to parse profile JSON:', err)
    }

    if (json?.id || json?._id || json?.userId) {
      const id = json.id ?? json._id ?? json.userId
      safeSetUserId(id)
    }

    if (isVariableValid(json)) {
      console.log('[UserContext] ✅ Valid user object received:', json)
      setUser(json)
    } else {
      console.log('[UserContext] ⚠️ Invalid or empty profile data:', json)
      setUser(null)
    }

    setLoading(false)
  }

  const refreshUser = async () => {
    try {
      console.log('[UserContext] 🔁 refreshUser called. Authenticated:', authenticated)
      if (!authenticated) {
        safeRemoveUserId()
        setUser(null)
        setLoading(false)
        return
      }

      setLoading(true)
      console.log('%c[UserContext] 🛰 Fetching /api/profile...', 'color: #4dd0e1;')
      const response = await fetch('/api/profile', { cache: 'no-store' })
      await handleProfile(response)
    } catch (error) {
      console.error('[UserContext] 💥 Error in refreshUser:', error)
      safeRemoveUserId()
      setUser(null)
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('%c[UserContext] 🔄 authenticated state changed:', 'color: #ffd54f;', authenticated)

    async function fetchData() {
      try {
        setLoading(true)
        console.log('%c[UserContext] 🛰 Calling /api/profile (initial mount)...', 'color: #4fc3f7;')
        const response = await fetch('/api/profile', { cache: 'no-store' })
        await handleProfile(response)
      } catch (error) {
        console.error('[UserContext] 💥 Error in fetchData:', error)
        safeRemoveUserId()
        setUser(null)
        setLoading(false)
      }
    }

    if (authenticated) {
      fetchData()
    } else {
      safeRemoveUserId()
      setUser(null)
      setLoading(false)
    }
  }, [authenticated])

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}
