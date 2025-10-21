import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const query = url.searchParams.get("query")

  if (!query || query.length < 3) {
    return NextResponse.json([], { status: 200 })
  }

  try {
    const results = await prisma.search.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      take: 15,
    })
    
    console.log("Search query:", query)
    console.log("Search results:", results)

    return NextResponse.json(results)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
