import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requestOtp } from "@/lib/otp-api"

export async function POST(req: NextRequest) {
  try {
    const { email, phone } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // ✅ Check if email or phone already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          ...(phone ? [{ phone: phone }] : []),
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email or phone already registered" },
        { status: 400 }
      )
    }

    // ✅ Continue to request OTP
    const response = await requestOtp({ email })

    return NextResponse.json({
      message: response.message,
      requestId: response.requestId,
    })
  } catch (error: any) {
    console.error("EMAIL TRY ERROR:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
