import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { generateTempToken, hashTempToken, isExpired } from "@/lib/temp-token"

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      )
    }

    const record = await prisma.tempVerification.findUnique({
      where: {
        identifier_identifier_type: {
          identifier: email,
          identifier_type: "email",
        },
      },
    })

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
        temp_token: hashedToken,
        temp_token_created_on: new Date(),
        otp: "USED",
      },
    })

    return NextResponse.json({
      message: "Email verified",
      tempToken,
    })
  } catch (error) {
    console.error("EMAIL VERIFY OTP ERROR:", error)
    return NextResponse.json(
      { error: "OTP verification failed" },
      { status: 500 }
    )
  }
}
