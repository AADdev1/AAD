import { NextRequest, NextResponse } from 'next/server'
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

    const isPhone = /^\d{10}$/.test(identifier)

    // 🔍 1️⃣ Find OTP in temp_verification table
    const verification = await prisma.tempVerification.findFirst({
      where: {
        identifier,
        otp,
      },
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // ⏳ 2️⃣ Check expiry
    const OTP_EXPIRY_MINUTES = 5

    const expiryTime = new Date(
      verification.otp_created_on.getTime() +
      OTP_EXPIRY_MINUTES * 60 * 1000
    )

    if (expiryTime < new Date()) {
      return NextResponse.json(
        { error: 'OTP expired' },
        { status: 400 }
      )
    }


    // 🔎 3️⃣ Find existing user
    const user = isPhone
      ? await prisma.user.findUnique({ where: { phone: identifier } })
      : await prisma.user.findUnique({ where: { email: identifier } })

    if (!user) {
      return NextResponse.json(
        { error: 'Account not found for this identifier' },
        { status: 404 }
      )
    }

    // 🔒 4️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    })

    // 🧹 5️⃣ Delete OTP after successful use
    await prisma.tempVerification.delete({
      where: { id: verification.id },
    })

    // 🔑 6️⃣ Issue JWT
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
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
