export const dynamic = "force-dynamic"
import { ProductGrid, ProductSkeletonGrid } from '@/components/native/Product'
import { Heading } from '@/components/native/heading'
import { Separator } from '@/components/native/separator'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

import {
   AvailableToggle,
   BrandCombobox,
   CategoriesCombobox,
   ClearFilterButton,
   SortBy,
} from './components/options'

export default async function Products({ searchParams }: any) {
   const {
      sort,
      isAvailable,
      brand,
      category,
      page = 1,
   } = searchParams || {}

   const brands = await prisma.brand.findMany()
   const categories = await prisma.category.findMany()

   const products = await prisma.product.findMany(
      Prisma.validator<Prisma.ProductFindManyArgs>()({
         where: {
            ...(isAvailable === 'true' && { isAvailable: true }),

            ...(brand && {
               brand: {
                  title: {
                     contains: brand,
                     mode: 'insensitive',
                  },
               },
            }),

            ...(category && {
               categories: {
                  some: {
                     title: {
                        contains: category,
                        mode: 'insensitive',
                     },
                  },
               },
            }),
         },
         orderBy: getOrderBy(sort),
         skip: (Number(page) - 1) * 12,
         take: 12,
         include: {
            brand: true,
            categories: true,
         },
      })
   )

   return (
      <>
         <Heading title="Products" description="" />

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
            <SortBy initialData={sort} />
            <CategoriesCombobox
               initialCategory={category}
               categories={categories}
            />
            <BrandCombobox initialBrand={brand} brands={brands} />
            <AvailableToggle initialData={isAvailable} />
            <ClearFilterButton />
         </div>

         <Separator />

         {products.length > 0 ? (
            <ProductGrid products={products} />
         ) : (
            <ProductSkeletonGrid />
         )}
      </>
   )
}

function getOrderBy(
   sort?: string
): Prisma.ProductOrderByWithRelationInput {
   if (sort === 'most_expensive') {
      return { price: 'desc' }
   }

   if (sort === 'least_expensive') {
      return { price: 'asc' }
   }

   return { createdAt: 'desc' }
}
