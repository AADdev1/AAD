'use client'

import { CartContextProvider } from '@/state/Cart'

export function CartWrapper({ children }: { children: React.ReactNode }) {
  return <CartContextProvider>{children}</CartContextProvider>
}
