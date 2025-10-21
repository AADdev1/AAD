import { NextRequest, NextResponse } from 'next/server'
import { verifyOtp } from '@/lib/otp-api'
import { signJWT } from '@/lib/jwt'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { otp, email, name, phone, password } = await req.json()

    if (!otp || !email || !password || !name) {
      return NextResponse.json(
        { error: 'otp, email, name, and password are required' },
        { status: 400 }
      )
    }

    // Verify OTP (mock API)
    const otpResponse = await verifyOtp({ otp, email })
    if (!otpResponse.token) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          phone: phone || null,
          passwordHash: hashedPassword,
        },
      })
    }

    // Sign JWT
    const token = await signJWT({ sub: user.id })

    // Set cookies
    const res = NextResponse.json({ message: otpResponse.message, user })
    res.cookies.set('token', token, { httpOnly: true, path: '/' })
    res.cookies.set('logged-in', 'true', { path: '/' })

    return res
  } catch (error: any) {
    console.error('VERIFY OTP ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
