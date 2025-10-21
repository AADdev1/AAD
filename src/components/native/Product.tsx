'use client'

import { useState } from 'react'
import { ImageSkeleton } from '@/components/native/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import CartButton from './cart_button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { ProductWithIncludes } from '@/types/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Plus, Minus, Heart } from 'lucide-react'

/* Product grid + skeletons are client too (keeps file unified) */
export const ProductGrid = ({ products }: { products: ProductWithIncludes[] }) => {
  return (
    <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <Product product={product} key={product.id} />
      ))}
    </div>
  )
}

export const ProductSkeletonGrid = () => {
  return (
    <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {[...Array(12)].map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}

export const Product = ({ product }: { product: ProductWithIncludes }) => {
  

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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`}>
          <div className="relative h-60 w-full">
            <Image
              className="rounded-t-lg"
              src={product?.images[0] || '/placeholder.png'}
              alt={product.title}
              fill
              sizes="(min-width: 1000px) 30vw, 50vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </Link>
      </CardHeader>

      <CardContent className="flex-grow grid gap-1 p-4">
        <Badge variant="outline" className="w-min text-neutral-500">
          {product?.categories?.[0]?.title}
        </Badge>

        <Link href={`/products/${product.id}`}>
          <h2 className="mt-2 font-medium">{product.title}</h2>
        </Link>
        <p className="text-xs text-neutral-500 line-clamp-2">
          {product.description}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between p-4">
        {product?.isAvailable ? <Price /> : <Badge variant="secondary">Out of stock</Badge>}

        {/* Cart controls aligned to bottom-right */}
        {product?.isAvailable && <CartButton product={product} />}

      </CardFooter>
    </Card>
  )
}

export function ProductSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
      <div className="relative h-40 w-full">
        <div className="flex h-40 w-full items-center justify-center rounded bg-neutral-300 dark:bg-neutral-700 ">
          <ImageSkeleton />
        </div>
      </div>
      <div className="p-5">
        <div className="w-full">
          <div className="mb-4 h-2.5 w-48 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
          <div className="mb-2.5 h-2 max-w-[480px] rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
        </div>
      </div>
    </div>
  )
}
