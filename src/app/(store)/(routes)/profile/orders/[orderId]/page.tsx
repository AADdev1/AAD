'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { UserCombobox } from '../../components/switcher'
import { OrderDetails } from './components/order-details'

const OrderPage = ({ params }: { params: { orderId: string } }) => {
   const { authenticated } = useAuthenticated()
   const [order, setOrder] = useState<any>(null)
   const pathname = usePathname()

   useEffect(() => {
      async function getOrder() {
         try {
            const response = await fetch(`/api/orders/${params.orderId}`, {
               method: 'GET',
               cache: 'no-store',
            })
            const json = await response.json()
            setOrder(json)
         } catch (error) {
            console.error('[ORDER_FETCH_ERROR]', error)
         }
      }
      if (authenticated) getOrder()
   }, [authenticated, params])

   return (
      <div className="flex-col">
         <div className="flex-1">
            <div className="flex items-center justify-between">
               <UserCombobox initialValue={pathname} />
            </div>

            {order ? (
               <OrderDetails order={order} />
            ) : (
               <Card className="my-4 bg-muted-foreground/5">
                  <CardContent>
                     <div className="h-[20vh]">
                        <div className="h-full my-4 flex items-center justify-center">
                           <Loader />
                        </div>
                     </div>
                  </CardContent>
               </Card>
            )}
         </div>
      </div>
   )
}

export default OrderPage
