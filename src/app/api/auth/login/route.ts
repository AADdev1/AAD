import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signJWT } from '@/lib/jwt' // your JWT helper

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json()

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify password
    const isPasswordValid = user.passwordHash
      ? await bcrypt.compare(password, user.passwordHash)
      : false

    // Log the login attempt
    await prisma.userLoginHistory.create({
      data: {
        userId: user.id,
        loginMethod: user.email === identifier ? 'email-password' : 'phone-password',
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: isPasswordValid ? 'success' : 'failed',
      },
    })

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Sign JWT
    const token = await signJWT({ sub: user.id })

    // Set cookies like OTP flow
    const res = NextResponse.json({ message: 'Login successful', user })
    res.cookies.set('token', token, { httpOnly: true, path: '/' })
    res.cookies.set('logged-in', 'true', { path: '/' })

    return res
  } catch (error: any) {
    console.error('PASSWORD LOGIN ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
