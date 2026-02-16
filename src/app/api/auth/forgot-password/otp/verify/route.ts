import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { isExpired } from '@/lib/temp-token'
import { signJWT } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    const { identifier, otp, newPassword } = await req.json()

    if (!identifier || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Identifier, OTP and newPassword are required' },
        { status: 400 }
      )
    }

    const isPhone = /^\d{10}$/.test(identifier)
    const identifierType = isPhone ? 'phone' : 'email'

    // 🔍 Find tempVerification using composite key
    const record = await prisma.tempVerification.findUnique({
      where: {
        identifier_identifier_type: {
          identifier,
          identifier_type: identifierType,
        },
      },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    if (record.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    if (isExpired(record.otp_created_on, 5)) {
      return NextResponse.json(
        { error: 'OTP expired' },
        { status: 400 }
      )
    }

    // 🔎 Find user
    const user = isPhone
      ? await prisma.user.findUnique({ where: { phone: identifier } })
      : await prisma.user.findUnique({ where: { email: identifier } })

    if (!user) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    // 🔒 Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    })

    // 🧹 Delete tempVerification after success
    await prisma.tempVerification.delete({
      where: { id: record.id },
    })

    // 🔑 Issue JWT
    const token = await signJWT({ sub: updatedUser.id })

    const res = NextResponse.json({
      message: 'Password updated successfully',
    })

    res.cookies.set('token', token, { httpOnly: true, path: '/' })
    res.cookies.set('logged-in', 'true', { path: '/' })

    return res
  } catch (error: any) {
    console.error('FORGOT PASSWORD VERIFY ERROR:', error)
    return NextResponse.json(
      { error: 'OTP verification failed' },
      { status: 500 }
    )
  }
}
