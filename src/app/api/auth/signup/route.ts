import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { hashTempToken, isExpired } from "@/lib/temp-token"
import { signJWT } from "@/lib/jwt"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      phone,
      emailTempToken,
      phoneTempToken,
      password,
      name,
    } = await req.json()

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      )
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Email or phone is required" },
        { status: 400 }
      )
    }

    let emailVerified = false
    let phoneVerified = false

    // ---------------- EMAIL VALIDATION ----------------
    if (email) {
      if (!emailTempToken) {
        return NextResponse.json(
          { error: "Email verification required" },
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

      if (
        !record ||
        record.is_signed_up ||
        !record.temp_token ||
        !record.temp_token_created_on
      ) {
        return NextResponse.json(
          { error: "Invalid email verification" },
          { status: 400 }
        )
      }

      if (isExpired(record.temp_token_created_on, 5)) {
        return NextResponse.json(
          { error: "Email verification expired" },
          { status: 400 }
        )
      }

      const hashedIncoming = crypto
        .createHash("sha256")
        .update(emailTempToken)
        .digest("hex")

      if (record.temp_token !== hashedIncoming) {
        return NextResponse.json(
          { error: "Invalid email verification" },
          { status: 400 }
        )

      }

      emailVerified = true
    }

    // ---------------- PHONE VALIDATION ----------------
    if (phone) {
      if (!phoneTempToken) {
        return NextResponse.json(
          { error: "Phone verification required" },
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

      if (
        !record ||
        record.is_signed_up ||
        !record.temp_token ||
        !record.temp_token_created_on
      ) {
        return NextResponse.json(
          { error: "Invalid phone verification" },
          { status: 400 }
        )
      }

      if (isExpired(record.temp_token_created_on, 5)) {
        return NextResponse.json(
          { error: "Phone verification expired" },
          { status: 400 }
        )
      }

      if (hashTempToken(phoneTempToken) !== record.temp_token) {
        return NextResponse.json(
          { error: "Invalid phone verification token" },
          { status: 400 }
        )
      }

      phoneVerified = true
    }

    if (!emailVerified && !phoneVerified) {
      return NextResponse.json(
        { error: "No valid verification provided" },
        { status: 400 }
      )
    }

    // ---------------- DUPLICATE USER CHECK ----------------
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // ---------------- CREATE USER ----------------
    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email: email || null,
        phone: phone || null,
        name: name || null,
        passwordHash,
        isEmailVerified: emailVerified,
        isPhoneVerified: phoneVerified,
      },
    })

    // ---------------- LOCK TEMP RECORDS ----------------
    await prisma.tempVerification.updateMany({
      where: {
        OR: [
          ...(email ? [{ identifier: email, identifier_type: "email" }] : []),
          ...(phone ? [{ identifier: phone, identifier_type: "phone" }] : []),
        ],
      },
      data: {
        is_signed_up: true,
      },
    })

    // ---------------- LOGIN ----------------
    const token = await signJWT({ sub: user.id })
    const res = NextResponse.json({ message: "Signup successful", user })

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
    })
    res.cookies.set("logged-in", "true", { path: "/" })

    return res
  } catch (error) {
    console.error("SIGNUP ERROR:", error)
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    )
  }
}
