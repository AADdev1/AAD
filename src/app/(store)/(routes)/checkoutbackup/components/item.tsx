'use client'

import { Spinner } from '@/components/native/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
   Card,
   CardContent,
   CardHeader,
} from '@/components/ui/card'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { getCountInCart, getLocalCart } from '@/lib/cart'
import { useCartContext } from '@/state/Cart'
import { MinusIcon, PlusIcon, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export const Item = ({ cartItem, unavailable = false }) => {
   const { authenticated } = useAuthenticated()
   const { cart, dispatchCart } = useCartContext()
   const [fetchingCart, setFetchingCart] = useState(false)

   const { product, productId, count } = cartItem

   function findLocalCartIndexById(array, productId) {
      for (let i = 0; i < array?.items?.length; i++) {
         if (array?.items[i]?.productId === productId) {
            return i
         }
      }
      return -1
   }

   async function getProduct() {
      try {
         const response = await fetch(`/api/product`, {
            method: 'POST',
            body: JSON.stringify({ productId }),
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json-string' },
         })

         return await response.json()
      } catch (error) {
         console.error({ error })
      }
   }

   async function onAddToCart() {
      if (unavailable) return

      if (!product?.isAvailable) {
         alert('Product is not available')
         return
      }

      const currentCount = getCountInCart({ cartItems: cart?.items, productId })
      if (currentCount + 1 > product?.stock) {
         alert(`Only ${product?.stock} items available`)
         return
      }

      try {
         setFetchingCart(true)

         if (authenticated) {
            const response = await fetch(`/api/cart`, {
               method: 'POST',
               body: JSON.stringify({
                  productId,
                  count: currentCount + 1,
               }),
               cache: 'no-store',
               headers: { 'Content-Type': 'application/json-string' },
            })

            const json = await response.json()
            dispatchCart(json)
         } else {
            const localCart = getLocalCart()
            const index = findLocalCartIndexById(localCart, productId)

            if (index >= 0) {
               localCart.items[index].count += 1
            } else {
               localCart.items.push({ productId, product: await getProduct(), count: 1 })
            }
            dispatchCart(localCart)
         }

         setFetchingCart(false)
      } catch (error) {
         console.error({ error })
      }
   }

   async function onRemoveFromCart() {
      if (unavailable) return

      try {
         setFetchingCart(true)

         if (authenticated) {
            const response = await fetch(`/api/cart`, {
               method: 'POST',
               body: JSON.stringify({
                  productId,
                  count: getCountInCart({ cartItems: cart?.items, productId }) - 1,
               }),
               cache: 'no-store',
               headers: { 'Content-Type': 'application/json-string' },
            })

            const json = await response.json()
            dispatchCart(json)
         } else {
            const localCart = getLocalCart()
            const index = findLocalCartIndexById(localCart, productId)

            if (index >= 0 && localCart.items[index].count > 1) {
               localCart.items[index].count -= 1
            } else if (index >= 0) {
               localCart.items.splice(index, 1)
            }
            dispatchCart(localCart)
         }

         setFetchingCart(false)
      } catch (error) {
         console.error({ error })
      }
   }

   function CartButton() {
      const count = getCountInCart({ cartItems: cart?.items, productId })

      if (unavailable) {
         return <Button disabled>🛒 Unavailable</Button>
      }

      if (fetchingCart) return <Button disabled><Spinner /></Button>
      if (count === 0) return <Button onClick={onAddToCart}>🛒 Add to Cart</Button>

      return (
         <>
            <Button variant="outline" size="icon" onClick={onRemoveFromCart}>
               {count === 1 ? <X className="h-4" /> : <MinusIcon className="h-4" />}
            </Button>
            <Button disabled variant="ghost" size="icon">{count}</Button>
            <Button variant="outline" size="icon" onClick={onAddToCart}>
               <PlusIcon className="h-4" />
            </Button>
         </>
      )
   }

   function Price() {
      if (product?.discount > 0) {
         const price = product?.price - product?.discount
         const percentage = (product?.discount / product?.price) * 100
         return (
            <div className="flex gap-2 items-center">
               <Badge className="flex gap-4" variant="destructive">
                  <div className="line-through">₹{product?.price}</div>
                  <div>%{percentage.toFixed(2)}</div>
               </Badge>
               <h2>₹{price.toFixed(2)}</h2>
            </div>
         )
      }
      return <h2>₹{product?.price}</h2>
   }

   return (
      <Card className="relative">
         {unavailable && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-red-600 font-bold text-lg pointer-events-none">
              
            </div>
         )}

         <CardHeader className="p-0 md:hidden">
            <div className="relative h-32 w-full">
               <Link href={`/products/${product?.id}`}>
                  <Image className="rounded-t-lg" src={product?.images[0]} alt="product image" fill style={{ objectFit: 'cover' }} />
               </Link>
            </div>
         </CardHeader>

         <CardContent className="grid grid-cols-6 gap-4 p-3">
            <div className="relative w-full col-span-2 hidden md:inline-flex">
               <Link href={`/products/${product?.id}`}>
                  <Image className="rounded-lg" src={product?.images[0]} alt="item image" fill style={{ objectFit: 'cover' }} />
               </Link>
            </div>
            <div className="col-span-4 block space-y-2">
               <Link href={`/products/${product?.id}`}><h2>{product?.title}</h2></Link>
               <p className="text-xs text-muted-foreground text-justify">{product?.description}</p>
               <Price />
               <CartButton />
            </div>
         </CardContent>
      </Card>
   )
}  