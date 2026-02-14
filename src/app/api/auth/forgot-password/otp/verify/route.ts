import { NextRequest, NextResponse } from 'next/server'
import { verifyOtp } from '@/lib/otp-api'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signJWT } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    const { identifier, otp, newPassword } = await req.json()

    if (!identifier || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Identifier, OTP, and newPassword are required' },
        { status: 400 }
      )
    }

    // 🔍 Determine identifier type
    const isPhone = /^\d{10}$/.test(identifier)

    // 🔐 Verify OTP
    const otpResponse = isPhone
      ? await verifyOtp({ otp, phone: identifier })
      : await verifyOtp({ otp, email: identifier })

    if (!otpResponse.token) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    // 🔎 Find existing user ONLY (no creation allowed)
    const user = isPhone
      ? await prisma.user.findUnique({ where: { phone: identifier } })
      : await prisma.user.findUnique({ where: { email: identifier } })

    if (!user) {
      return NextResponse.json(
        { error: 'Account not found for this identifier' },
        { status: 404 }
      )
    }

    // 🔒 Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // 🔄 Update password
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    })

    // 🔑 Issue JWT (auto-login after reset)
    const token = await signJWT({ sub: updatedUser.id })

    const res = NextResponse.json({
      message: 'Password updated successfully',
      user: updatedUser,
    })

    res.cookies.set('token', token, { httpOnly: true, path: '/' })
    res.cookies.set('logged-in', 'true', { path: '/' })

    return res
  } catch (error: any) {
    console.error('VERIFY OTP & UPDATE PASSWORD ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
