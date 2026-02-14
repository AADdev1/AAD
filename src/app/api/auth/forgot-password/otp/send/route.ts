import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json()

    if (!identifier) {
      return NextResponse.json(
        { error: 'Email or phone is required' },
        { status: 400 }
      )
    }

    const isPhone = /^\d{10}$/.test(identifier)

    // 🔍 Find user by identifier
    const user = isPhone
      ? await prisma.user.findUnique({ where: { phone: identifier } })
      : await prisma.user.findUnique({ where: { email: identifier } })

    if (!user) {
      return NextResponse.json(
        { error: 'Account not found with this identifier' },
        { status: 404 }
      )
    }

    // 🔐 Check verification status
    if (isPhone && !user.isPhoneVerified) {
      return NextResponse.json(
        { error: 'Phone number is not verified for password recovery' },
        { status: 403 }
      )
    }

    if (!isPhone && !user.isEmailVerified) {
      return NextResponse.json(
        { error: 'Email is not verified for password recovery' },
        { status: 403 }
      )
    }

    // ✅ Phase-1 success: OTP CAN be sent (but not yet)
    return NextResponse.json({
      message: 'Identifier verified. OTP can be sent.',
      nextStep: 'SEND_OTP',
    })
  } catch (error: any) {
    console.error('FORGOT PASSWORD PRECHECK ERROR:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
