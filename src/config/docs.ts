import { NavItem } from '@/types/nav'

interface DocsConfig {
  
   sidebarNav: NavItem[]
}

export const docsConfig: DocsConfig = {
  
   sidebarNav: [
      {
         title: 'Products',
         href: '/products',
      },
    
      {
         title: 'Orders',
         href: '/profile/orders',
      },
     
      {
         title: 'Contact',
         href: '/contact',
      },
      {
         title: 'About',
         href: '/aboutus',
      },
   ],
}
