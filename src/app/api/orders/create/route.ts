import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('🛒 Incoming /api/order/create body:', JSON.stringify(body, null, 2))

    const { userId, addressId, products, discountCodeId, notes = {} } = body

    // --- 1️⃣ Validations ---
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Products are required' }, { status: 400 })
    }

    // --- 2️⃣ Fetch product details ---
    const productIds = products.map((p: any) => p.productId)
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true, price: true, discount: true },
    })

    if (dbProducts.length !== products.length) {
      return NextResponse.json({ error: 'Some products not found' }, { status: 404 })
    }

    // --- 3️⃣ Calculate totals ---
    let total = 0
    let discount = 0
    const shipping = 0
    const tax = 0

    for (const item of products) {
      const product = dbProducts.find((p) => p.id === item.productId)
      if (!product) continue

      const price = Number(product.price) || 0
      const disc = Number(product.discount) || 0
      const qty = Number(item.quantity) || 1

      total += price * qty
      discount += disc * qty
    }

    const payable = total - discount + tax + shipping

    // --- 4️⃣ Create Order Summary ---
    const summary = dbProducts
      .map((p) => {
        const prod = products.find((x) => x.productId === p.id)
        return `${p.title || p.id} x ${prod?.quantity || 1}`
      })
      .join(', ')

    // --- 5️⃣ Create Order in DB ---
    const order = await prisma.order.create({
      data: {
        userId,
        addressId,
        total,
        discount,
        tax,
        shipping,
        payable,
        discountCodeId,
        status: 'PENDING',
        isPaid: false,
        isCompleted: false,
        // notes stored inside metadata if needed in JSON
      },
    })

    // --- 6️⃣ Create Order Items ---
    const orderItemsData = products.map((item: any) => {
      const product = dbProducts.find((p) => p.id === item.productId)
      return {
        orderId: order.id,
        productId: item.productId,
        count: item.quantity,
        price: Number(product?.price) || 0,
        discount: Number(product?.discount) || 0,
      }
    })

    await prisma.orderItem.createMany({ data: orderItemsData })

    // --- 7️⃣ Return response ---
    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: {
        ...order,
        summary,
        items: orderItemsData,
      },
    })
  } catch (err: any) {
    console.error('❌ Error creating order:', err)
    return NextResponse.json(
      { error: 'Server error', details: err.message },
      { status: 500 }
    )
  }
}
