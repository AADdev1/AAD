'use client'

import { ImageSkeleton } from '@/components/native/icons'
import { Badge } from '@/components/ui/badge'
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

/* =========================
   Product Grid
========================= */
export const ProductGrid = ({
  products,
}: {
  products: ProductWithIncludes[]
}) => {
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <Product product={product} key={product.id} />
      ))}
    </div>
  )
}

/* =========================
   Skeleton Grid
========================= */
export const ProductSkeletonGrid = () => {
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {[...Array(12)].map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}

/* =========================
   Product Card
========================= */
export const Product = ({
  product,
}: {
  product: ProductWithIncludes
}) => {
  function Price() {
    if (product.discount > 0) {
      const price = product.price - product.discount
      const percentage = (product.discount / product.price) * 100

      return (
        <div className="flex flex-col gap-1">
          <Badge className="w-fit flex gap-2" variant="destructive">
            <span className="line-through">₹{product.price}</span>
            <span>-{percentage.toFixed(0)}%</span>
          </Badge>
          <span className="text-base font-semibold">
            ₹{price.toFixed(2)}
          </span>
        </div>
      )
    }

    return (
      <span className="text-base font-semibold">
        ₹{product.price}
      </span>
    )
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      {/* Image */}
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`}>
          <div className="relative h-60 w-full">
            <Image
              src={product.images[0] || '/placeholder.png'}
              alt={product.title}
              fill
              sizes="(min-width: 1000px) 30vw, 50vw"
              className="object-cover"
            />
          </div>
        </Link>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex flex-grow flex-col gap-2 p-4">
        <Badge variant="outline" className="w-fit text-neutral-500">
          {product.categories?.[0]?.title}
        </Badge>

        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 font-medium leading-snug">
            {product.title}
          </h3>
        </Link>

        <p className="line-clamp-2 text-xs text-neutral-500">
          {product.description}
        </p>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-end justify-between gap-3 p-4 pt-0">
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

/* =========================
   Skeleton Card
========================= */
export function ProductSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
      <div className="relative h-40 w-full">
        <div className="flex h-40 w-full items-center justify-center rounded bg-neutral-300 dark:bg-neutral-700">
          <ImageSkeleton />
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div className="h-2.5 w-24 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-3 w-full rounded-full bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-3 w-2/3 rounded-full bg-neutral-200 dark:bg-neutral-700" />
      </div>
    </div>
  )
}
