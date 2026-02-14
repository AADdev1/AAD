import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { generateTempToken, hashTempToken, isExpired } from "@/lib/temp-token"

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json()

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone and OTP are required" },
        { status: 400 }
      )
    }

    const record = await prisma.tempVerification.findUnique({
      where: {
        identifier_identifier_type: {
          identifier: phone,
          identifier_type: "phone",
        },
      },
    })

    // ✅ FIXED
    if (!record || record.is_signed_up) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      )
    }

    if (record.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      )
    }

    // ✅ FIXED
    if (isExpired(record.otp_created_on, 5)) {
      return NextResponse.json(
        { error: "OTP expired" },
        { status: 400 }
      )
    }

    const tempToken = generateTempToken()
    const hashedToken = hashTempToken(tempToken)

    await prisma.tempVerification.update({
      where: { id: record.id },
      data: {
        temp_token: hashedToken, // ✅ FIXED
        temp_token_created_on: new Date(), // ✅ FIXED
        otp: "USED",
      },
    })

    return NextResponse.json({
      message: "Phone verified",
      tempToken,
    })
  } catch (error) {
    console.error("PHONE VERIFY OTP ERROR:", error)
    return NextResponse.json(
      { error: "OTP verification failed" },
      { status: 500 }
    )
  }
}
