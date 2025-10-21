import { NextRequest, NextResponse } from 'next/server'
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

    let response
    if (/^\d{10}$/.test(identifier)) {
      // It's a phone number
      response = await requestOtp({ phone: identifier })
    } else {
      // Assume it's an email
      response = await requestOtp({ email: identifier })
    }

    return NextResponse.json({
      message: response.message || 'OTP sent successfully',
    })
  } catch (error: any) {
    console.error('SEND OTP ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
