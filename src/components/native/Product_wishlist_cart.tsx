'use client'

import { ImageSkeleton } from '@/components/native/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { ProductWithIncludes } from '@/types/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Heart, ShoppingCart, Plus, Minus } from 'lucide-react'
import { useWishlistContext } from '@/state/Wishlist'

export const Product = ({ product }: { product: ProductWithIncludes }) => {
  const { items: wishlist, dispatch } = useWishlistContext()
  const [cartQty, setCartQty] = useState(0)

  // ✅ check if product already in wishlist
  const isInWishlist = wishlist.some((w: any) => w.id === product.id)

  function Price() {
    if (product?.discount > 0) {
      const price = product?.price - product?.discount
      const percentage = (product?.discount / product?.price) * 100
      return (
        <div className="flex gap-2 items-center">
          <Badge className="flex gap-2" variant="destructive">
            <span className="line-through">₹{product?.price}</span>
            <span>-{percentage.toFixed(0)}%</span>
          </Badge>
          <h2 className="font-semibold">₹{price.toFixed(2)}</h2>
        </div>
      )
    }
    return <h2 className="font-semibold">₹{product?.price}</h2>
  }

  const toggleWishlist = async () => {
    try {
      if (isInWishlist) {
        // ❌ Remove
        await fetch(`/api/wishlist`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-USER-ID': localStorage.getItem('userId') ?? '',
          },
          body: JSON.stringify({ productId: product.id }),
        })

        dispatch({
          type: 'SET_WISHLIST',
          payload: wishlist.filter((w: any) => w.id !== product.id),
        })
      } else {
        // ✅ Add
        await fetch(`/api/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-USER-ID': localStorage.getItem('userId') ?? '',
          },
          body: JSON.stringify({ productId: product.id }),
        })

        dispatch({ type: 'SET_WISHLIST', payload: [...wishlist, product] })
      }
    } catch (err) {
      console.error('[Wishlist Toggle Error]', err)
    }
  }


  const updateCart = async (newQty: number) => {
    try {
      setCartQty(newQty) // update UI immediately

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-USER-ID': localStorage.getItem('userId') ?? '',
        },
        body: JSON.stringify({
          productId: product.id,
          count: newQty,
        }),
      })

      if (!response.ok) {
        console.error('[Cart API Error]', await response.text())
      } else {
        const cart = await response.json()
        console.log('[Cart Updated]', cart)
      }
    } catch (err) {
      console.error('[Cart Update Error]', err)
    }
  }




  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-0 relative">
        <Link href={`/products/${product.id}`}>
          <div className="relative h-60 w-full">
            <Image
              className="rounded-t-lg"
              src={product?.images[0]}
              alt={product.title}
              fill
              sizes="(min-width: 1000px) 30vw, 50vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </Link>

        {/* ❤️ Wishlist button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 rounded-full bg-white/90 hover:bg-white p-2 shadow-md transition"
        >
          <Heart
             className={`h-5 w-5 ${
      isInWishlist
        ? 'fill-red-500 text-red-500'
        : 'text-neutral-800 dark:text-neutral-200'
    }`}
          />
        </button>
      </CardHeader>

      <CardContent className="flex-grow grid gap-2 p-4">
        <Badge variant="outline" className="w-min text-neutral-500">
          {product?.categories[0]?.title}
        </Badge>

        <h2 className="font-medium">{product.title}</h2>
        <p className="text-xs text-neutral-500 line-clamp-2">{product.description}</p>
      </CardContent>

      <CardFooter className="flex items-center justify-between p-4">
        {product?.isAvailable ? <Price /> : <Badge variant="secondary">Out of stock</Badge>}

        {/* 🛒 Cart buttons */}
        {product.isAvailable && (
          cartQty === 0 ? (
            <Button size="sm" onClick={() => updateCart(1)}>
              <ShoppingCart className="h-4 w-4 mr-1" /> Add
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" onClick={() => updateCart(cartQty - 1)}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-2">{cartQty}</span>
              <Button size="icon" variant="outline" onClick={() => updateCart(cartQty + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )
        )}
      </CardFooter>
    </Card>
  )
}
