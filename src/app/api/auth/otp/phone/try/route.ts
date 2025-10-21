import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requestOtp } from "@/lib/otp-api"

export async function POST(req: NextRequest) {
  try {
    const { phone, email } = await req.json()

    if (!phone) {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 })
    }

    // ✅ Check if user already exists by phone or email (optional)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: phone },
          ...(email ? [{ email: email }] : []),
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Phone or email already registered" },
        { status: 400 }
      )
    }

    // ✅ Continue to request OTP
    const response = await requestOtp({ phone })

    return NextResponse.json({
      message: response.message,
      requestId: response.requestId,
    })
  } catch (error: any) {
    console.error("PHONE TRY ERROR:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
