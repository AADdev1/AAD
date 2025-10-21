'use client'

import { FC } from 'react'
import { Product } from '@/components/native/Product_wishlist_cart'
import { useWishlistContext } from '@/state/Wishlist'

const WishlistGrid: FC = () => {
  const { items, loading } = useWishlistContext()

  if (loading) {
    return <p className="text-center text-neutral-500">Loading wishlist...</p>
  }

  if (!items || items.length === 0) {
    return <p className="text-center text-neutral-500">Your wishlist is empty.</p>
  }

  return (
    <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {items.map((item: any) => (
        <Product key={item.id} product={item} />
      ))}
    </div>
  )
}

export { WishlistGrid }
