'use client'

import { Separator } from '@/components/native/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { isVariableValid } from '@/lib/utils'
import Link from 'next/link'

interface ReceiptProps {
  cartItems?: any[]
  loading?: boolean
}

export function Receipt({ cartItems = [], loading = false }: ReceiptProps) {
   const { authenticated } = useAuthenticated()

   function calculatePayableCost() {
      let totalAmount = 0,
         discountAmount = 0

      if (isVariableValid(cartItems)) {
         for (const item of cartItems) {
            totalAmount += item?.count * item?.product?.price
            discountAmount += item?.count * item?.product?.discount
         }
      }

      const afterDiscountAmount = totalAmount - discountAmount
      const taxAmount = afterDiscountAmount * 0.09
      // const payableAmount = afterDiscountAmount + taxAmount
      const payableAmount = afterDiscountAmount 

      return {
         totalAmount: totalAmount.toFixed(2),
         discountAmount: discountAmount.toFixed(2),
         afterDiscountAmount: afterDiscountAmount.toFixed(2),
         taxAmount: taxAmount.toFixed(2),
         payableAmount: payableAmount.toFixed(2),
      }
   }

   const costs = calculatePayableCost()

   return (
      <Card className={loading ? 'animate-pulse' : ''}>
         <CardHeader className="p-4 pb-0">
            <h2 className="font-bold tracking-tight">Receipt</h2>
         </CardHeader>
         <CardContent className="p-4 text-sm">
            <div className="block space-y-[1vh]">
               <div className="flex justify-between">
                  <p>Total Amount</p>
                  <h3>₹{costs.totalAmount}</h3>
               </div>
               <div className="flex justify-between">
                  <p>Discount Amount</p>
                  <h3>₹{costs.discountAmount}</h3>
               </div>
               {/* <div className="flex justify-between">
                  <p>Tax Amount</p>
                  <h3>₹{costs.taxAmount}</h3>
               </div> */}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between">
               <p>Payable Amount</p>
               <h3>₹{costs.payableAmount}</h3>
            </div>
         </CardContent>
         <Separator />
         <CardFooter>
            <Link
               href={authenticated ? '/checkout' : '/login'}
               className="w-full"
            >
               <Button
                  disabled={!isVariableValid(cartItems) || cartItems.length === 0 || loading}
                  className="w-full"
               >
                  Checkout
               </Button>
            </Link>
         </CardFooter>
      </Card>
   )
}