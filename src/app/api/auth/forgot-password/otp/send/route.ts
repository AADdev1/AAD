import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requestOtp } from '@/lib/otp-api'

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
    const identifierType = isPhone ? 'phone' : 'email'

    // 🔍 Check user exists
    const user = isPhone
      ? await prisma.user.findUnique({ where: { phone: identifier } })
      : await prisma.user.findUnique({ where: { email: identifier } })

    if (!user) {
      return NextResponse.json(
        { error: 'Account not found with this identifier' },
        { status: 404 }
      )
    }

    // 🔐 Generate OTP
    const otpResponse = await requestOtp(
      isPhone ? { phone: identifier } : { email: identifier }
    )

    const otp = otpResponse.otp

    // 🔁 UPSERT tempVerification
    await prisma.tempVerification.upsert({
      where: {
        identifier_identifier_type: {
          identifier,
          identifier_type: identifierType,
        },
      },
      create: {
        identifier,
        identifier_type: identifierType,
        otp,
        otp_created_on: new Date(),
      },
      update: {
        otp,
        otp_created_on: new Date(),
        temp_token: null,
        temp_token_created_on: null,
      },
    })

    return NextResponse.json({
      message: 'OTP sent successfully',
    })
  } catch (error: any) {
    console.error('FORGOT PASSWORD SEND OTP ERROR:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}
