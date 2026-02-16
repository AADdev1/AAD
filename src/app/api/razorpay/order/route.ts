import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('🔥 Incoming /api/razorpay/order body:', JSON.stringify(body, null, 2))

    const { userId, addressId, products, discountCodeId, notes = {}, currency = 'INR', receipt } = body

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
    const shipping = 100
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
    const amountInPaise = Math.round(payable * 100)

    if (!amountInPaise || amountInPaise < 100) {
      return NextResponse.json({ error: 'Amount must be at least ₹1.00' }, { status: 400 })
    }

    // --- 4️⃣ Create Razorpay order ---
    const key_id = process.env.RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET

    if (!key_id || !key_secret) {
      return NextResponse.json({ error: 'Razorpay credentials not configured' }, { status: 500 })
    }

    const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64')
    const receiptNumber = receipt || `receipt#${Math.floor(Math.random() * 1000000)}`

    console.log('🪄 Creating Razorpay order...')
    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: receiptNumber,
        notes,
      }),
    })

    const razorpayData = await razorpayRes.json()

    if (!razorpayRes.ok) {
      console.log('❌ Razorpay Error:', razorpayData)
      return NextResponse.json(
        { error: 'Failed to create Razorpay order', details: razorpayData },
        { status: 400 }
      )
    }

    // --- 5️⃣ Create Order Summary (from your existing logic) ---
    const summary = dbProducts
      .map((p) => {
        const prod = products.find((x) => x.productId === p.id)
        return `${p.title || p.id} x ${prod?.quantity || 1}`
      })
      .join(', ')

    // --- 6️⃣ Create Order in DB ---
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
        razorpayId: razorpayData.id,
        status: 'Processing',
        isPaid: false,
        isCompleted: false,
        // no razorpayOrderId added — same table structure
      },
    })

    // --- 7️⃣ Create Order Items ---
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

    // --- 8️⃣ Final Response ---
    return NextResponse.json({
      success: true,
      message: 'Razorpay order created and DB order saved successfully',
      orderId: order.id,
      razorpayOrder: razorpayData,
      order: {
        ...order,
        summary,
        items: orderItemsData,
      },
      amount: amountInPaise,
      currency,
    })
  } catch (err: any) {
    console.error('❌ Error creating order:', err)
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 })
  }
}
