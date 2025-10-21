import { NextRequest, NextResponse } from 'next/server'
import { verifyOtp } from '@/lib/otp-api'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'
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

    let otpResponse
    if (/^\d{10}$/.test(identifier)) {
      // Phone number
      otpResponse = await verifyOtp({ otp, phone: identifier })
    } else {
      // Email
      otpResponse = await verifyOtp({ otp, email: identifier })
    }

    if (!otpResponse.token) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user password in Prisma
    let user
    if (/^\d{10}$/.test(identifier)) {
      user = await prisma.user.findUnique({ where: { phone: identifier } })
      if (!user) {
        // Create user if phone not exists
        user = await prisma.user.create({
          data: { phone: identifier, role: 'USER', passwordHash: hashedPassword },
        })
      } else {
        // Update password
        user = await prisma.user.update({
          where: { phone: identifier },
          data: { passwordHash: hashedPassword },
        })
      }
    } else {
      user = await prisma.user.findUnique({ where: { email: identifier } })
      if (!user) {
        return NextResponse.json(
          { error: 'User not found with this email' },
          { status: 404 }
        )
      } else {
        user = await prisma.user.update({
          where: { email: identifier },
          data: { passwordHash: hashedPassword },
        })
      }
    }

    // Sign JWT
    const token = await signJWT({ sub: user.id })

    // Set cookies
    const res = NextResponse.json({ message: 'Password updated successfully', user })
    res.cookies.set('token', token, { httpOnly: true, path: '/' })
    res.cookies.set('logged-in', 'true', { path: '/' })

    return res
  } catch (error: any) {
    console.error('VERIFY OTP & UPDATE PASSWORD ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
