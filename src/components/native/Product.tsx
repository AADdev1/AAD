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


export const Product = ({ product }: { product: ProductWithIncludes }) => {
  function Price() {
    if (product?.discount > 0) {
      const price = product.price - product.discount
      const percentage = (product.discount / product.price) * 100

      return (
        <div className="flex flex-col gap-1">
          <Badge className="w-fit flex gap-2" variant="destructive">
            <span className="line-through">₹{product.price}</span>
            <span>-{percentage.toFixed(0)}%</span>
          </Badge>
          <span className="text-base font-semibold">₹{price.toFixed(2)}</span>
        </div>
      )
    }

    return <span className="text-base font-semibold">₹{product.price}</span>
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Image */}
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`}>
          <div className="relative h-60 w-full">
            <Image
              src={product.images[0] || '/placeholder.png'}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(min-width: 1000px) 30vw, 50vw"
            />
          </div>
        </Link>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex flex-col gap-2 p-4 flex-grow">
        <Badge variant="outline" className="w-fit text-neutral-500">
          {product?.categories?.[0]?.title}
        </Badge>

        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium leading-snug line-clamp-2">
            {product.title}
          </h3>
        </Link>

        <p className="text-xs text-neutral-500 line-clamp-2">
          {product.description}
        </p>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-4 pt-0 flex items-end justify-between gap-3">
        {product.isAvailable ? (
          <Price />
        ) : (
          <Badge variant="secondary">Out of stock</Badge>
        )}

        {product.isAvailable && <CartButton product={product} />}
      </CardFooter>
    </Card>
  )
}
