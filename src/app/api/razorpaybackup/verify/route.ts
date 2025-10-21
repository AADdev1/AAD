  // app/api/razorpay/verify/route.ts
  import { NextResponse } from 'next/server'
  import crypto from 'crypto'

  export async function POST(req: Request) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        await req.json()

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json(
          { success: false, message: 'Missing payment details' },
          { status: 400 }
        )
      }

      const secret = process.env.RAZORPAY_KEY_SECRET as string

      // step 1: generate signature
      const body = razorpay_order_id + '|' + razorpay_payment_id
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex')

      // step 2: compare
      const isAuthentic = expectedSignature === razorpay_signature

      if (isAuthentic) {
        console.log('✅ Payment Verified:', {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
        })
        return NextResponse.json({ success: true })
      } else {
        console.error('❌ Payment Verification Failed:', {
          expectedSignature,
          razorpay_signature,
        })
        return NextResponse.json({ success: false, message: 'Invalid signature' })
      }
    } catch (err) {
      console.error('Error in verification:', err)
      return NextResponse.json(   
        { success: false, message: 'Server error' },
        { status: 500 }
      )
    }
  }
