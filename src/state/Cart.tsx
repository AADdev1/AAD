'use client'

import { getLocalCart, writeLocalCart } from '@/lib/cart'
import { isVariableValid } from '@/lib/utils'
import { useUserContext } from '@/state/User'
import React, { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext({
  cart: null,
  loading: true,
  refreshCart: async () => {},
  dispatchCart: (cart) => {},
  toggleSelect: (productId: string) => {},
  toggleSelectAll: () => {},
})

export const useCartContext = () => useContext(CartContext)

export const CartContextProvider = ({ children }) => {
  const { user, loading: userLoading } = useUserContext()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  const dispatchCart = (newCart) => {
    setCart(newCart)
    writeLocalCart(newCart)
  }

  const toggleSelect = (productId) => {
    if (!cart) return
    const newCart = { ...cart }
    const index = newCart.items.findIndex((i) => i.productId === productId)
    if (index >= 0) {
      newCart.items[index].selected = !newCart.items[index].selected
      dispatchCart(newCart)
    }
  }

  const toggleSelectAll = () => {
    if (!cart) return
    const allSelected = cart.items.every((i) => i.selected)
    const newCart = {
      ...cart,
      items: cart.items.map((i) => ({ ...i, selected: !allSelected })),
    }
    dispatchCart(newCart)
  }

  const fetchProfileAndStoreUserId = async () => {
    try {
      console.log('🧩 Fetching profile to get userId...')
      const res = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        cache: 'no-store',
      })

      if (!res.ok) {
        console.warn('⚠️ Profile API failed with', res.status)
        return null
      }

      const profile = await res.json()
      if (profile && profile?.cart && profile?.phone) {
        // try to guess userId from cart or response headers later
        // but safer to rely on backend sending it if available
        console.log('✅ Profile fetched successfully:', profile)

        if (profile?.id) {
          localStorage.setItem('userId', profile.id)
          return profile.id
        }
      }

      return null
    } catch (error) {
      console.error('[PROFILE_FETCH_ERROR]', error)
      return null
    }
  }

  const refreshCart = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    setLoading(true)

    try {
      let userId = user?.id || localStorage.getItem('userId')

      // 🚀 If userId not found, try to fetch it via profile API
      if (!isVariableValid(userId)) {
        userId = await fetchProfileAndStoreUserId()
      }

      if (isVariableValid(userId)) {
        console.log('🧍 Using userId:', userId)
        const res = await fetch('/api/cart', {
          method: 'GET',
          headers: {
            'X-USER-ID': userId,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
          cache: 'no-store',
        })

        if (!res.ok) throw new Error('Failed to fetch cart')

        const dbCart = await res.json()
        const itemsWithSelect = dbCart.items.map((i) => ({
          ...i,
          selected: i.selected ?? true,
        }))
        const formattedCart = { ...dbCart, items: itemsWithSelect }

        dispatchCart(formattedCart)
      } else {
        console.log('🛒 Using guest mode cart')
        const localCart = getLocalCart()
        if (isVariableValid(localCart?.items)) {
          localCart.items = localCart.items.map((i) => ({
            ...i,
            selected: i.selected ?? true,
          }))
          dispatchCart(localCart)
        } else {
          dispatchCart({ items: [] })
        }
      }
    } catch (error) {
      console.error('[REFRESH_CART_ERROR]', error)
      const localCart = getLocalCart()
      if (isVariableValid(localCart?.items)) dispatchCart(localCart)
      else dispatchCart({ items: [] })
    } finally {
      setIsSyncing(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshCart()
  }, [])

  useEffect(() => {
    if (!userLoading && (user?.id || localStorage.getItem('userId'))) {
      refreshCart()
    }
  }, [user?.id, userLoading])

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        refreshCart,
        dispatchCart,
        toggleSelect,
        toggleSelectAll,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
