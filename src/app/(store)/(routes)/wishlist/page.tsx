'use client'

import { Heading } from '@/components/native/heading'
import { WishlistContextProvider } from '@/state/Wishlist'
import { WishlistGrid } from './components/wishlist-grid'

export default function WishlistPage() {
  return (
    <WishlistContextProvider>
      <Heading
        title="Wishlist"
        description="Below is a list of products you have in your wishlist."
      />
      <WishlistGrid />
    </WishlistContextProvider>
  )
}
