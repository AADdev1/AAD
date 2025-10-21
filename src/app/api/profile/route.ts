import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requestOtp, verifyOtp } from '@/lib/otp-api'  // ✅ use same helpers

export async function GET(req: Request) {
  try {
    const userId = req.headers.get('X-USER-ID')

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        cart: {
          include: {
            items: { include: { product: true } },
          },
        },
        addresses: true,
        wishlist: true,
      },
    })

    return NextResponse.json({
      id: user.id, // ✅ add this line
      phone: user.phone,
      email: user.email,
      name: user.name,
      birthday: user.birthday,
      addresses: user.addresses,
      wishlist: user.wishlist,
      cart: user.cart,
    })

  } catch (error: any) {
    console.error('[PROFILE_GET] Error fetching profile:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = req.headers.get('X-USER-ID')
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { name, phone, email, otp, field, requestId } = body

    // 1️⃣ Update name directly
    if (name && !phone && !email && !otp) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name },
      })
      return NextResponse.json(updatedUser)
    }

    // 2️⃣ Request OTP for email/phone update
    if ((phone || email) && !otp) {
      // Check for uniqueness first


      if (email) {
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing && existing.id !== userId) {
          return NextResponse.json(
            { error: 'This email is linked to another account.' },
            { status: 400 }
          )
        }
      }

      if (phone) {
        const existing = await prisma.user.findUnique({ where: { phone } })
        if (existing && existing.id !== userId) {
          return NextResponse.json(
            { error: 'This mobile is linked to another account.' },
            { status: 400 }
          )
        }
      }

      // If no conflicts → continue with OTP request
      const contactField = phone ? { phone } : { email }
      const response = await requestOtp(contactField)

      return NextResponse.json({
        status: 'pending_verification',
        field: phone ? 'phone' : 'email',
      })
    }

    // 3️⃣ Verify OTP and update DB

    if (otp && field) {
      const verifyPayload: any = { otp }
      if (field === 'phone' && phone) verifyPayload.phone = phone
      if (field === 'email' && email) verifyPayload.email = email

      const response = await verifyOtp(verifyPayload)

      if (!response.token) {
        return NextResponse.json(
          { error: 'OTP verification failed' },
          { status: 400 }
        )
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(field === 'phone' ? { phone } : {}),
          ...(field === 'email'
            ? { email, isEmailVerified: true }
            : {}),
        },
      })

      return NextResponse.json({
        status: 'verified',
        user: updatedUser,
      })
    }



    return new NextResponse('Bad request', { status: 400 })
  } catch (error: any) {
    console.error('[PROFILE_PATCH] Error updating profile:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
