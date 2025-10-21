// /api/address/check.ts
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()

  const exists = await prisma.address.findFirst({
    where: {
      address: body.addressLine1,
      city: body.city,
      phone: body.phone,
      postalCode: body.postalCode,
    },
  })

  return NextResponse.json({ exists: !!exists })
}
