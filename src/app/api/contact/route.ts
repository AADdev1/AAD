import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  console.log('📩 [CONTACT_POST] Request received')

  try {
    // Step 1: Get userId from header
    const userId = req.headers.get('X-USER-ID')
    console.log('👉 [CONTACT_POST] X-USER-ID header:', userId)

    if (!userId) {
      console.warn('🚫 [CONTACT_POST] Missing user ID header. Returning 401.')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Step 2: Parse request body
    const { purpose, subCategory, message } = await req.json()
    console.log('📝 [CONTACT_POST] Payload:', { purpose, subCategory, message })

    if (!purpose || !subCategory || !message) {
      console.warn('⚠️ [CONTACT_POST] Missing required fields')
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    // Step 3: Insert into database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        userId,
        purpose,
        subCategory,
        message,
      },
    })

    console.log('✅ [CONTACT_POST] Message saved successfully:', contactMessage.id)

    // Step 4: Return success response
    return NextResponse.json({
      message: 'Message received successfully.',
      contactMessageId: contactMessage.id,
    })
  } catch (error) {
    console.error('❌ [CONTACT_POST] Error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
    