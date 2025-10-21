'use client'

import { createContext, useContext, useEffect, useReducer } from 'react'

type WishlistState = {
  loading: boolean
  items: any[]
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_WISHLIST'; payload: any[] }

const WishlistContext = createContext<any>(null)

function wishlistReducer(state: WishlistState, action: Action): WishlistState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_WISHLIST':
      return { ...state, items: action.payload, loading: false }
    default:
      return state
  }
}

export function WishlistContextProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, {
    loading: true,
    items: [],
  })

  useEffect(() => {
    async function fetchWishlist() {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const response = await fetch('/api/wishlist', {
          cache: 'no-store',
          headers: { 'X-USER-ID': localStorage.getItem('userId') ?? '' },
        })

        const json = await response.json()

        console.log('[Wishlist API Response]', json)

        // ✅ FIX: set only the array of products
        dispatch({ type: 'SET_WISHLIST', payload: json.items ?? [] })
      } catch (err) {
        console.error('[Wishlist Fetch Error]', err)
        dispatch({ type: 'SET_WISHLIST', payload: [] })
      }
    }

    fetchWishlist()
  }, [])

  return (
    <WishlistContext.Provider value={{ ...state, dispatch }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlistContext() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlistContext must be used within WishlistContextProvider')
  return context
}
