import { NextRequest, NextResponse } from 'next/server'
import { verifyOtp } from '@/lib/otp-api'
import { signJWT } from '@/lib/jwt'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(req: NextRequest) {
  try {
    const { otp, phone, name, password, email } = await req.json()

    // ✅ Validate inputs
    if (!otp || !phone || !name || !password) {
      return NextResponse.json(
        { error: 'otp, phone, name, and password are required' },
        { status: 400 }
      )
    }

    // ✅ Verify OTP using phone number
    const otpResponse = await verifyOtp({ otp, phone })
    if (!otpResponse.token) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    // ✅ Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 12)

    // ✅ Find or create user by phone number
    let user = await prisma.user.findUnique({ where: { phone } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name,
          email: email || null,
          passwordHash: hashedPassword,
        },
      })
    }

    // ✅ Sign JWT token (sub = user id)
    const token = await signJWT({ sub: user.id })

    // ✅ Send response and set cookies
    const res = NextResponse.json({ message: otpResponse.message, user })
    res.cookies.set('token', token, { httpOnly: true, path: '/' })
    res.cookies.set('logged-in', 'true', { path: '/' })

    return res
  } catch (error: any) {
    console.error('VERIFY OTP (PHONE) ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
  