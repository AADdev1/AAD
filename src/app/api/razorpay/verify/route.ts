import { NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'

/**
 * ✅ Razorpay Payment Verification + Order Completion API
 * This endpoint verifies Razorpay signature, logs payment,
 * updates order, adjusts inventory, and syncs cart.
 * 
 * Steps:
 * 1️⃣ Verify Razorpay signature using secret key
 * 2️⃣ If authentic:
 *     - Create Payment entry
 *     - Mark Order as Paid
 *     - Update product stock (check before decrement)
 *     - Update/clear Cart items
 * 3️⃣ If verification fails:
 *     - Log failed Payment (no stock/order/cart update)
 */

export async function POST(req: Request) {
  try {
    // ✅ Parse incoming body
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderItemsData, // Array of { productId, quantity/count, price, discount }
      orderId,
      userId,
      payable,
      fee,
    } = await req.json()

    // ✅ Use providerId from .env (secure)
    const providerId = process.env.PROVIDER_ID || 'razorpay'

    // ✅ Log incoming payload (for debugging/tracing)
    console.log('🔹 Incoming Razorpay Verification Request:', {
      orderId,
      userId,
      razorpay_order_id,
      razorpay_payment_id,
      itemCount: orderItemsData?.length || 0,
    })

    // 🔸 Log order items for audit
    if (orderItemsData && Array.isArray(orderItemsData)) {
      console.log('🧾 Received orderItemsData:', JSON.stringify(orderItemsData, null, 2))
    } else {
      console.log('ℹ️ No valid orderItemsData received.')
    }

    // 🛑 Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('❌ Missing essential Razorpay fields', { razorpay_order_id, razorpay_payment_id })
      return NextResponse.json({ success: false, message: 'Missing payment details' }, { status: 400 })
    }

    // ✅ Fetch secret key from environment
    const secret = process.env.RAZORPAY_KEY_SECRET as string
    if (!secret) {
      console.error('❌ Missing Razorpay secret key in environment variables')
      return NextResponse.json({ success: false, message: 'Server misconfiguration: missing secret' }, { status: 500 })
    }

    // ✅ Step 1: Verify Razorpay Signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto.createHmac('sha256', secret).update(body.toString()).digest('hex')
    const isAuthentic = expectedSignature === razorpay_signature

    console.log('🔍 Signature verification:', {
      expectedSignature,
      receivedSignature: razorpay_signature,
      isAuthentic,
    })

    // --------------------------------------------------------------------------
    // ✅ Step 2: Handle Authentic Payment
    // --------------------------------------------------------------------------
    if (isAuthentic) {
      console.log('✅ Signature valid → proceeding with payment transaction flow...')

      try {
        const txResult = await prisma.$transaction(async (tx) => {
          // ✅ 1) Create Payment record
          console.log('💳 Creating payment record...')
          const payment = await tx.payment.create({
            data: {
              refId: razorpay_payment_id,
              status: 'Paid',
              isSuccessful: true,
              payable: payable ? Number(payable) : undefined,
              fee: fee ? Number(fee) : null,
              providerId,
              userId: userId || null,
              orderId: orderId || null,
            },
          })
          console.log(`✅ Payment recorded with ID: ${payment.id}`)

          // ✅ 2) Mark Order as Paid
          if (orderId) {
            console.log(`🧾 Updating order [${orderId}] as Paid...`)
            await tx.order.update({
              where: { id: orderId },
              data: {
                isPaid: true,
                status: 'Paid',
                razorpayId: razorpay_payment_id,
              },
            })
            console.log('✅ Order updated successfully.')
          }

          // ✅ 3) Update Inventory & Cart
          if (Array.isArray(orderItemsData) && orderItemsData.length > 0 && userId) {
            console.log('📦 Adjusting product stock and cart items...')
            for (const item of orderItemsData) {
              const productId = item.productId || item.productId === 0 ? item.productId : null
              const quantity = Number(item.quantity ?? item.count ?? 0)

              if (!productId || quantity <= 0) continue

              // 🔍 Fetch current product stock
              const currentProduct = await tx.product.findUnique({
                where: { id: productId },
                select: { stock: true, title: true },
              })

              if (!currentProduct) {
                console.error(`❌ Product not found: ${productId}`)
                throw new Error(`Product not found: ${productId}`)
              }

              // 🚫 Out-of-stock check before decrement
              if (currentProduct.stock < quantity) {
                console.warn(
                  `⚠️ Out of stock for ${currentProduct.title || productId}. Requested ${quantity}, available ${currentProduct.stock}.`
                )
                // Abort transaction with clear message (frontend will show refund notice)
                throw new Error(
                  `Out of stock for ${currentProduct.title || 'one of your items'}. Refund will be initiated in 3–5 working days.`
                )
              }

              // ✅ Sufficient stock → decrement
              await tx.product.update({
                where: { id: productId },
                data: { stock: { decrement: quantity } },
              })
              console.log(`✅ Stock updated for ${currentProduct.title || productId}: -${quantity}`)

              // 🛒 Update or remove from cart
              try {
                const existingCartItem = await tx.cartItem.findUnique({
                  where: {
                    UniqueCartItem: { cartId: userId, productId },
                  },
                })

                if (existingCartItem) {
                  if ((existingCartItem.count ?? 0) > quantity) {
                    await tx.cartItem.update({
                      where: {
                        UniqueCartItem: { cartId: userId, productId },
                      },
                      data: { count: { decrement: quantity } },
                    })
                    console.log(`🛒 Cart updated for ${productId}: -${quantity}`)
                  } else {
                    await tx.cartItem.delete({
                      where: {
                        UniqueCartItem: { cartId: userId, productId },
                      },
                    })
                    console.log(`🗑️ Removed ${productId} from cart.`)
                  }
                }
              } catch (cartErr) {
                console.error('⚠️ Error updating cart for', productId, cartErr)
                throw cartErr
              }
            }
          }

          return { message: 'DB transaction completed', paymentId: 'payment.id' }
        }) // end of transaction

        console.log('✅ Transaction completed successfully:', txResult)
        return NextResponse.json({ success: true, message: 'Payment verified and transaction completed' })
      } catch (dbErr: any) {
        // ⚠️ Handle DB transaction failures (e.g., out-of-stock or DB errors)
        console.error('❌ Database transaction error:', dbErr)
        return NextResponse.json(
          {
            success: true,
            message: dbErr.message?.includes('Out of stock')
              ? dbErr.message
              : 'Payment verified but DB transaction failed. Check server logs.',
            dbError: true,
            details: dbErr?.message,
          },
          { status: 200 }
        )
      }
    }

    // --------------------------------------------------------------------------
    // ❌ Step 3: Handle Invalid Signature
    // --------------------------------------------------------------------------
    console.error('❌ Payment verification failed (invalid signature):', {
      expectedSignature,
      razorpay_signature,
    })

    try {
      // Still record a failed payment entry (for audit)
      console.log('💳 Logging failed payment attempt...')
      const failedPayment = await prisma.payment.create({
        data: {
          refId: razorpay_payment_id,
          status: 'Failed',
          isSuccessful: false,
          payable: payable ? Number(payable) : undefined,
          fee: fee ? Number(fee) : null,
          providerId,
          userId: userId || null,
          orderId: orderId || null,
        },
      })
      console.log('ℹ️ Failed payment logged:', failedPayment.id)
    } catch (logErr) {
      console.error('⚠️ Error logging failed payment:', logErr)
    }

    return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 })
  } catch (err) {
    console.error('💥 Server error in verification route:', err)
    return NextResponse.json({ success: false, message: 'Server error', details: err }, { status: 500 })
  }
}
