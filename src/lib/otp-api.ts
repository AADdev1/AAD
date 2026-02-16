// lib/otp-api.ts
import crypto from "crypto"
import { sendHtmlEmail } from "./gmailService"

const OTP_EXPIRY_MINUTES = 5

function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString()
}

function buildOtpHtml(otp: string) {
  return `
    <div style="font-family:Arial;padding:20px">
      <h2>Your Verification Code</h2>
      <p>Use this OTP to continue:</p>
      <div style="font-size:28px;font-weight:bold;letter-spacing:5px;margin:20px 0;">
        ${otp}
      </div>
      <p>This code is valid for ${OTP_EXPIRY_MINUTES} minutes.</p>
    </div>
  `
}

function normalizeIndianPhoneForVendor(phone: string): string {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '')

  // Remove leading 0 (011 digits case)
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1)
  }

  // Remove leading 91 if present
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.slice(2)
  }

  // Final validation
  if (cleaned.length !== 10) {
    throw new Error('Invalid Indian phone number format')
  }

  return cleaned
}


async function sendSmsOtp(phone: string, otp: string) {
  const apiKey = process.env.TWOFACTOR_API_KEY

  if (!apiKey) {
    throw new Error("Missing TWOFACTOR_API_KEY")
  }

  const url = `https://2factor.in/API/V1/${apiKey}/SMS/${phone}/${otp}/prodotp1`

  const response = await fetch(url, {
    method: "GET",
  })

  if (!response.ok) {
    throw new Error("Failed to send SMS OTP")
  }

  const data = await response.json()

  if (data.Status !== "Success") {
    throw new Error("2Factor API error: " + data.Details)
  }
}



export async function requestOtp(target: {
  email?: string
  phone?: string
}) {
  const identifier = target.email || target.phone

  if (!identifier) {
    throw new Error("Email or phone required")
  }

  const otp = generateOtp()

  // ✅ EMAIL FLOW
  if (target.email) {
    await sendHtmlEmail(
      target.email,
      "Your OTP Verification Code",
      buildOtpHtml(otp)
    )

    console.log(`📧 OTP sent to email: ${target.email}`)
  }

  // 🚧 PHONE FLOW (unchanged)
  if (target.phone) {
    const normalizedPhone = normalizeIndianPhoneForVendor(target.phone)

    await sendSmsOtp(normalizedPhone, otp)

    console.log(`📱 OTP sent to phone: ${normalizedPhone}`)
  }


  return {
    message: "OTP generated",
    otp, // caller stores in DB
  }
}

export async function verifyOtp() {
  throw new Error(
    "verifyOtp is no longer used. OTP verification is handled via temp_verification table."
  )
}
