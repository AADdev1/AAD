import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requestOtp } from '@/lib/otp-api'

/* =========================
   GET PROFILE
========================= */
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
      id: user.id,
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

/* =========================
   UPDATE PROFILE
========================= */
export async function PATCH(req: Request) {
  try {
    const userId = req.headers.get('X-USER-ID')
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { name, phone, email, otp, field } = body

    /* 1️⃣ Update name directly */
    if (name && !phone && !email && !otp) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name },
      })
      return NextResponse.json(updatedUser)
    }

    /* 2️⃣ Request OTP for email/phone update */
    if ((phone || email) && !otp) {
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

      const contactField = phone ? { phone } : { email }
      await requestOtp(contactField)

      return NextResponse.json({
        status: 'pending_verification',
        field: phone ? 'phone' : 'email',
      })
    }

    /* 3️⃣ Verify OTP and update DB */
    if (otp && field) {
      const identifier = field === 'phone' ? phone : email

      if (!identifier) {
        return NextResponse.json(
          { error: 'Missing identifier' },
          { status: 400 }
        )
      }

      const record = await prisma.tempVerification.findUnique({
        where: {
          identifier_identifier_type: {
            identifier,
            identifier_type: field,
          },
        },
      })

      if (!record || record.is_signed_up) {
        return NextResponse.json(
          { error: 'Invalid or expired OTP' },
          { status: 400 }
        )
      }

      if (record.otp !== otp) {
        return NextResponse.json(
          { error: 'Invalid OTP' },
          { status: 400 }
        )
      }

      // ⏳ Expiry check (5 minutes)
      const expiryTime = new Date(
        record.otp_created_on.getTime() + 5 * 60 * 1000
      )

      if (expiryTime < new Date()) {
        return NextResponse.json(
          { error: 'OTP expired' },
          { status: 400 }
        )
      }

      // Mark OTP used
      await prisma.tempVerification.update({
        where: { id: record.id },
        data: {
          otp: 'USED',
          temp_token: null,
          temp_token_created_on: null,
        },
      })

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(field === 'phone'
            ? { phone, isPhoneVerified: true }
            : {}),
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
