'use client'

import { Card, CardContent } from '@/components/ui/card'
import { isVariableValid } from '@/lib/utils'
import { useCartContext } from '@/state/Cart'
import { Item } from './item'
import { Receipt } from './receipt'
import { Skeleton } from './skeleton'

export const CartGrid = () => {
   const { loading, cart } = useCartContext()

   if (isVariableValid(cart?.items) && cart?.items?.length === 0) {
      return (
         <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
               <Card>
                  <CardContent className="p-4">
                     <p>Your Cart is empty...</p>
                  </CardContent>
               </Card>
            </div>
            <Receipt cartItems={[]} loading={loading} />
         </div>
      )
   }

   const availableItems: any[] = []
   const unavailableItems: any[] = []

   cart?.items?.forEach(item => {
      const productAvailable = item.product?.isAvailable
      const stock = item.product?.stock || 0

      if (productAvailable && item.count <= stock) {
         // Fully available
         availableItems.push({ ...item })
      } else if (productAvailable && item.count > stock) {
         // Partially available
         if (stock > 0) {
            availableItems.push({ ...item, count: stock })
         }
         unavailableItems.push({ ...item, count: item.count - stock })
      } else {
         // Completely unavailable
         unavailableItems.push({ ...item })
      }
   })

   return (
      <div className="mb-4 space-y-6">
         {/* Available Products Section */}
         {availableItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
               <div className="md:col-span-2 space-y-3">
                  <h3 className="text-lg font-bold mb-2">Available Products</h3>
                  {availableItems
                     .slice() // avoid mutating the original array
                     .sort((a, b) => (a.product?.title ?? '').localeCompare(b.product?.title ?? ''))
                     .map((cartItem, index) => (
                        <Item cartItem={cartItem} key={index} unavailable={false} />
                     ))}
               </div>
               <Receipt cartItems={availableItems} loading={loading} />
            </div>
         )}

         {/* Unavailable Products Section */}
         {unavailableItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
               <div className="md:col-span-2 space-y-3">
                  <h3 className="text-lg font-bold mb-2">Unavailable Products</h3>
                  {unavailableItems.map((cartItem, index) => (
                     <Item cartItem={cartItem} key={index} unavailable={true} />
                  ))}
               </div>
            </div>
         )}

         {/* Skeletons if loading */}
         {loading && [...Array(5)].map((_, index) => <Skeleton key={index} />)}
      </div>
   )
}