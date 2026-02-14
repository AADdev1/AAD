import {
   BlogPostCard,
   BlogPostGrid,
   BlogPostSkeletonGrid,
} from '@/components/native/BlogCard'
import Carousel from '@/components/native/Carousel'
import MobileCarousel from '@/components/native/MobileCarousel'
import { ProductGrid, ProductSkeletonGrid } from '@/components/native/Product'
import { Heading } from '@/components/native/heading'
import { Separator } from '@/components/native/separator'
import prisma from '@/lib/prisma'
import { isVariableValid } from '@/lib/utils'

export default async function Index() {
   const products = await prisma.product.findMany({
      include: {
         brand: true,
         categories: true,
      },
   })

   const blogs = await prisma.blog.findMany({
      include: { author: true },
      take: 3,
   })

   const banners = await prisma.banner.findMany({
      select: {
         image: true
         
      },
   })

   return (
      <div className="flex flex-col border-neutral-200 dark:border-neutral-700">
         <div className="hidden md:block">
            <Carousel images={banners.map((obj) => obj.image)} />
         </div>
         <div className="block md:hidden">
            <MobileCarousel images={banners.map((obj) => obj.mobileImage || obj.image)} />
         </div>
         <Separator className="mt-5 mb-2" />

         <Heading
            title="Products"
            description="Below is a list of products we have available for you."
         />
         {isVariableValid(products) ? (
            <ProductGrid products={products} />
         ) : (
            <ProductSkeletonGrid />
         )}
         <Separator className="my-8" />
         {isVariableValid(blogs) ? (
            <BlogPostGrid blogs={blogs} />
         ) : (
            <BlogPostSkeletonGrid />
         )}
      </div>
   )
}
