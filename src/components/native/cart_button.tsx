import { Spinner } from '@/components/native/icons'
import { Button } from '@/components/ui/button'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { getCountInCart, getLocalCart } from '@/lib/cart'
import { CartContextProvider, useCartContext } from '@/state/Cart'
import { MinusIcon, PlusIcon, ShoppingBasketIcon, X } from 'lucide-react'
import { useState } from 'react'

export default function CartButton({ product }) {
   return (
      <CartContextProvider>
         <ButtonComponent product={product} />
      </CartContextProvider>
   )
}

export function ButtonComponent({ product }) {
   const { authenticated } = useAuthenticated()
   const { cart, dispatchCart } = useCartContext()
   const [fetchingCart, setFetchingCart] = useState(false)

   function findLocalCartIndexById(array, productId) {
      for (let i = 0; i < array?.items?.length; i++) {
         if (array.items[i]?.productId === productId) return i
      }
      return -1
   }

   async function onAddToCart() {
      setFetchingCart(true)
      const count = getCountInCart({ cartItems: cart?.items, productId: product?.id })
      const localCart = getLocalCart() as any

      try {
         if (authenticated) {
            const res = await fetch('/api/cart', {
               method: 'POST',
               body: JSON.stringify({ productId: product?.id, count: count + 1 }),
               headers: { 'Content-Type': 'application/json-string' },
               cache: 'no-store',
            })
            dispatchCart(await res.json())
         } else {
            const idx = findLocalCartIndexById(localCart, product?.id)
            if (idx > -1) localCart.items[idx].count += 1
            else localCart.items.push({ productId: product?.id, product, count: 1 })
            dispatchCart(localCart)
         }
      } catch (e) {
         console.error(e)
      } finally {
         setFetchingCart(false)
      }
   }

   async function onRemoveFromCart() {
      setFetchingCart(true)
      const count = getCountInCart({ cartItems: cart?.items, productId: product?.id })
      const localCart = getLocalCart() as any
      const index = findLocalCartIndexById(localCart, product?.id)

      try {
         if (authenticated) {
            const res = await fetch('/api/cart', {
               method: 'POST',
               body: JSON.stringify({ productId: product?.id, count: count - 1 }),
               headers: { 'Content-Type': 'application/json-string' },
               cache: 'no-store',
            })
            dispatchCart(await res.json())
         } else {
            if (count > 1) localCart.items[index].count -= 1
            else localCart.items.splice(index, 1)
            dispatchCart(localCart)
         }
      } catch (e) {
         console.error(e)
      } finally {
         setFetchingCart(false)
      }
   }

   const count = getCountInCart({ cartItems: cart?.items, productId: product?.id })

   if (fetchingCart)
      return (
         <Button disabled size="sm" className="px-3 py-1">
           
         </Button>
      )

   if (count === 0)
      return (
         <Button
            className="flex items-center gap-1 text-sm px-3 py-1"
            onClick={onAddToCart}
         >
            <ShoppingBasketIcon className="w-4 h-4" /> Add
         </Button>
      )


return (
  <div className="inline-flex items-center rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
    <Button
      size="icon"
      variant="ghost"
      className="p-1 text-gray-700 dark:text-gray-200"
      onClick={onRemoveFromCart}
    >
      {count === 1 ? <X className="w-4 h-4" /> : <MinusIcon className="w-4 h-4" />}
    </Button>

    <div className="px-2 text-sm font-medium text-gray-800 dark:text-gray-100">
      {count}
    </div>

    <Button
      size="icon"
      variant="ghost"
      className="p-1 text-gray-700 dark:text-gray-200"
      onClick={onAddToCart}
    >
      <PlusIcon className="w-4 h-4" />
    </Button>
  </div>
)

}
