import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

/* ---------------------------------- GET CART ---------------------------------- */
export async function GET(req: Request) {
  console.log('🛒 [GET_CART] Request received')

  try {
    const userId = req.headers.get('X-USER-ID')
    console.log('👉 [GET_CART] X-USER-ID header:', userId)

    if (!userId) {
      console.warn('🚫 [GET_CART] Missing user ID header. Returning 401.')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    console.log('🔍 [GET_CART] Querying Prisma for userId:', userId)
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                categories: true,
              },
            },
          },
        },
      },
    })

    if (!cart) {
      console.warn('⚠️ [GET_CART] No cart found for user:', userId)
      return NextResponse.json({ message: 'No cart found', items: [] }, { status: 200 })
    }

    console.log('✅ [GET_CART] Cart fetched successfully:')
    console.log({
      userId: cart.userId,
      totalItems: cart.items?.length ?? 0,
      lastUpdated: cart.updatedAt || 'N/A',
      itemProductIds: cart.items?.map(i => i.productId),
    })

    return NextResponse.json(cart)
  } catch (error) {
    console.error('❌ [GET_CART] Error while fetching cart:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

/* ---------------------------------- POST CART ---------------------------------- */
/* ---------------------------------- POST CART (optimized) ---------------------------------- */
export async function POST(req: Request) {
  try {
    const userId = req.headers.get('X-USER-ID')

    if (!userId) {
      console.warn('🚫 [CART_POST] Missing userId header')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { productId, count } = await req.json()

    if (!productId || typeof count !== 'number') {
      return NextResponse.json({ error: 'Invalid productId or count' }, { status: 400 })
    }

    console.log(`🛍️ [CART_POST] userId=${userId} productId=${productId} count=${count}`)

    // 1) Validate product (availability & stock)
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, isAvailable: true, title: true },
    })

    if (!product) {
      console.warn('🚫 [CART_POST] Product not found:', productId)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (!product.isAvailable) {
      console.warn('⚠️ [CART_POST] Product not available:', product.title)
      return NextResponse.json(
        { error: `Product "${product.title}" is not available` },
        { status: 400 }
      )
    }

    if (count > product.stock) {
      console.warn('⚠️ [CART_POST] Quantity exceeds stock for:', product.title)
      return NextResponse.json(
        { error: `Only ${product.stock} units available for "${product.title}"` },
        { status: 400 }
      )
    }

    // 2) All writes + final read in ONE DB round-trip
    const cart = await prisma.$transaction(async (tx) => {
      if (count < 1) {
        // Ensure cart record exists (you chose to KEEP cart even if empty)
        await tx.cart.upsert({
          where: { userId },
          create: { user: { connect: { id: userId } } },
          update: {},
        })
        // Remove item; ignore if it didn't exist (keeps behavior graceful)
        try {
          await tx.cartItem.delete({
            where: { UniqueCartItem: { cartId: userId, productId } },
          })
        } catch {
          /* no-op */
        }
      } else {
        // Upsert cart + upsert item count
        await tx.cart.upsert({
          where: { userId },
          create: {
            user: { connect: { id: userId } },
            items: { create: { productId, count } },
          },
          update: {
            items: {
              upsert: {
                where: { UniqueCartItem: { cartId: userId, productId } },
                update: { count },
                create: { productId, count },
              },
            },
          },
        })
      }

      // Return updated cart (same shape you used)
      return tx.cart.findUniqueOrThrow({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  stock: true,
                  isAvailable: true,
                  images: true,
                },
              },
            },
          },
        },
      })
    })

    return NextResponse.json(cart)
  } catch (error) {
    console.error('❌ [CART_POST] Error (optimized):', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
