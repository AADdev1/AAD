import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requestOtp } from "@/lib/otp-api"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // ❌ Block if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // 🔐 Generate OTP (provider or fallback)
    const otpResponse = await requestOtp({ email })
    const otp = otpResponse.otp // ensure otp-api returns this

    // 🔁 UPSERT temp_verification
await prisma.tempVerification.upsert({
  where: {
    identifier_identifier_type: {
      identifier: email,
      identifier_type: "email",
    },
  },
  create: {
    identifier: email,
    identifier_type: "email",
    otp,
    otp_created_on: new Date(),
  },
  update: {
    otp,
    otp_created_on: new Date(),
    temp_token: null,
    temp_token_created_on: null,
    is_signed_up: false,
  },
})
  


    return NextResponse.json({ message: "OTP sent to email" })
  } catch (error: any) {
    console.error("EMAIL TRY OTP ERROR:", error)
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    )
  }
}
