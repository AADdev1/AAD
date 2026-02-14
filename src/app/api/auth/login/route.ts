import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signJWT } from "@/lib/jwt"



export async function POST(req: NextRequest) {
  try {
    
    const { identifier, password } = await req.json()

console.log("LOGIN IDENTIFIER:", identifier)


    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Identifier and password required" },
        { status: 400 }
      )
    }


    
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
        ],
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 400 }
      )
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid login" },
        { status: 400 }
      )
    }

    const valid = await bcrypt.compare(password, user.passwordHash)

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 400 }
      )
    }

    const token = await signJWT({ sub: user.id })
    const res = NextResponse.json({ message: "Login successful" })

    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
    })

    res.cookies.set("logged-in", "true", { path: "/" })

    return res
  } catch (error) {
    console.error("LOGIN ERROR:", error)
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}
