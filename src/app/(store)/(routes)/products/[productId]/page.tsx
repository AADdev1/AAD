import Carousel from '@/components/native/Carousel'
import prisma from '@/lib/prisma'
import { isVariableValid } from '@/lib/utils'
import { ChevronRightIcon } from 'lucide-react'
import type { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'

import { DataSection } from './components/data'

type Props = {
  params: { productId: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: {
      id: params.productId,
    },
  })

  return {
    title: product?.title,
    description: product?.description,
    keywords: product?.keywords,
    openGraph: {
      images: product?.images,
    },
  }
}

export default async function Product({
  params,
}: {
  params: { productId: string }
}) {
  const product = await prisma.product.findUnique({
    where: {
      id: params.productId,
    },
    include: {
      brand: true,
      categories: true,
    },
  })

  if (!isVariableValid(product)) return null

  return (
    <>
      <Breadcrumbs product={product} />

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <ImageColumn product={product} />
        <DataSection product={product} />
      </div>
    </>
  )
}

const ImageColumn = ({ product }: { product: any }) => {
  return (
    <div className="relative col-span-1 min-h-[50vh] w-full">
      <Carousel images={product.images} />
    </div>
  )
}

const Breadcrumbs = ({ product }: { product: any }) => {
  return (
    <nav className="flex text-muted-foreground" aria-label="Breadcrumb">
      <ol className="inline-flex items-center gap-2">
        <li>
          <Link href="/" className="text-sm font-medium">
            Home
          </Link>
        </li>

        <li className="flex items-center gap-2">
          <ChevronRightIcon className="h-4 w-4" />
          <Link href="/products" className="text-sm font-medium">
            Products
          </Link>
        </li>

        <li className="flex items-center gap-2" aria-current="page">
          <ChevronRightIcon className="h-4 w-4" />
          <span className="text-sm font-medium">
            {product.title}
          </span>
        </li>
      </ol>
    </nav>
  )
}
