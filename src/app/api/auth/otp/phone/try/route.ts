import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requestOtp } from "@/lib/otp-api"

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      )
    }

    // ❌ Block if phone already registered
    const existingUser = await prisma.user.findUnique({
      where: { phone },
      select: { id: true },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Phone number already registered" },
        { status: 400 }
      )
    }

    // 🔐 Generate OTP
    const otpResponse = await requestOtp({ phone })
    const otp = otpResponse.otp

    // 🔁 UPSERT temp_verification
    await prisma.tempVerification.upsert({
      where: {
        identifier_identifier_type: {
          identifier: phone,
          identifier_type: "phone",
        },
      },
      create: {
        identifier: phone,
        identifier_type: "phone",
        otp,
        otpCreatedOn: new Date(),
      },
      update: {
        otp,
        otpCreatedOn: new Date(),
        tempToken: null,
        tempTokenCreatedOn: null,
        isSignedUp: false,
      },
    })

    return NextResponse.json({ message: "OTP sent to phone" })
  } catch (error: any) {
    console.error("PHONE TRY OTP ERROR:", error)
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    )
  }
}
