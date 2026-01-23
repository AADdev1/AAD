'use client'

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import config from '@/config/site'
import Link from 'next/link'
import Image from 'next/image'

export function MainNav() {
  return (
    <div className="flex items-center gap-6">
      {/* Logo - Left most */}
      <Link href="/" className="flex items-center">
        <Image
          src="/logo.png"
          alt={config.name}
          width={40}
          height={40}
          className="object-contain"
          priority
        />
      </Link>

      {/* Navigation */}
      <NavMenu />
    </div>
  )
}

export function NavMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/products" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <span className="font-normal text-foreground/70">
                Products
              </span>
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
