'use client'

import { UserContextProvider } from '@/state/User'
import { CartWrapper } from '@/providers/cart-wrapper'

export function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <UserContextProvider>
      <CartWrapper>{children}</CartWrapper>
    </UserContextProvider>
  )
}
