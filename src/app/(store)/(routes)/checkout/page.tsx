'use client'

import { Heading } from '@/components/native/heading'
import { CartContextProvider } from '@/state/Cart'
import { CartGrid } from './components/grid'

export default function Checkout() {
  return (
    <CartContextProvider>
      <Heading title="Checkout" description="Select address and complete payment." />
      <CartGrid />
    </CartContextProvider>
  )
}
