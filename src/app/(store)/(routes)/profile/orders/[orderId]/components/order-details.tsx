'use client'

import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export function OrderDetails({ order }: { order: any }) {
   const {
      number,
      status,
      payable,
      tax,
      discount,
      shipping,
      isPaid,
      isCompleted,
      address,
      payments,
      refund,
      orderItems,
      createdAt,
      updatedAt,
   } = order

   return (
      <div className="my-6 space-y-6">
         {/* Header */}
         <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
               <div>
                  <CardTitle className="text-lg font-semibold">
                     Order #{number}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                     Placed on {new Date(createdAt).toLocaleString()}
                  </p>
               </div>
               <Badge
                  variant={isCompleted ? 'default' : 'secondary'}
                  className="mt-2 sm:mt-0"
               >
                  {status}
               </Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
               <div>
                  <p className="text-sm text-muted-foreground">Payable</p>
                  <p className="font-medium">₹{payable.toFixed(2)}</p>
               </div>
               <div>
                  <p className="text-sm text-muted-foreground">Shipping</p>
                  <p className="font-medium">₹{shipping.toFixed(2)}</p>
               </div>
               <div>
                  <p className="text-sm text-muted-foreground">Discount</p>
                  <p className="font-medium">₹{discount.toFixed(2)}</p>
               </div>
               <div>
                  <p className="text-sm text-muted-foreground">Tax</p>
                  <p className="font-medium">₹{tax.toFixed(2)}</p>
               </div>
               <div>
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="font-medium">{isPaid ? 'Yes' : 'No'}</p>
               </div>
               <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="font-medium">{isCompleted ? 'Yes' : 'No'}</p>
               </div>
            </CardContent>
         </Card>

         {/* Items Section */}
         <Card>
            <CardHeader>
               <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {orderItems?.map((item: any) => (
                  <div
                     key={item.id}
                     className="flex items-center justify-between border-b last:border-none pb-2"
                  >
                     <div className="flex items-center space-x-4">
                        <Image
                           src={item.product?.images?.[0] || '/placeholder.png'}
                           alt={item.product?.title}
                           width={96}
                           height={96}
                           className="rounded-md object-cover border"
                        />
                        <div>
                           <p className="font-medium">{item.product?.title}</p>
                           <p className="text-sm text-muted-foreground">
                              Qty × {item.count}
                           </p>
                        </div>
                     </div>
                     <p className="font-medium">
                        ₹{(item.count * item.price).toFixed(2)}
                     </p>
                  </div>
               ))}
            </CardContent>
         </Card>

         {/* Payment Details */}
         {payments?.length > 0 && (
            <Card>
               <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
               </CardHeader>
               <CardContent className="space-y-2">
                  {payments.map((pay: any) => (
                     <div
                        key={pay.id}
                        className="flex items-center justify-between"
                     >
                        <div>
                           <p className="font-medium">{pay.provider.name}</p>
                           <p className="text-sm text-muted-foreground">
                              ID: {pay.id}
                           </p>
                        </div>
                        <Badge
                           variant={isPaid ? 'default' : 'secondary'}
                           className="text-xs"
                        >
                           {isPaid ? 'Paid' : 'Unpaid'}
                        </Badge>
                     </div>
                  ))}
               </CardContent>
            </Card>
         )}

         {/* Address */}
         {address && (
            <Card>
               <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
               </CardHeader>
               <CardContent className="text-sm space-y-1">
                  <p>{address.name}</p>
                  <p>{address.street}</p>
                  <p>
                     {address.city}, {address.state} {address.zip}
                  </p>
                  <p>{address.country}</p>
               </CardContent>
            </Card>
         )}

         {/* Refund Details */}
         {refund && (
            <Card>
               <CardHeader>
                  <CardTitle>Refund Details</CardTitle>
               </CardHeader>
               <CardContent className="space-y-1">
                  <p>
                     Amount: ₹{refund.amount?.toFixed(2)} •
                     <span className="text-muted-foreground">
                        {refund.status}
                     </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                     {new Date(refund.createdAt).toLocaleString()}
                  </p>
               </CardContent>
            </Card>
         )}

         {/* Footer */}
         <div className="text-xs text-muted-foreground text-right">
            Last updated {new Date(updatedAt).toLocaleString()}
         </div>
      </div>
   )
}
