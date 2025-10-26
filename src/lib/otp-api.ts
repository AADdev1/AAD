const BASE_URL = "https://gmail-otp-api.onrender.com"

export async function requestOtp(target: { phone?: string; email?: string }) {
  const url = target.email
    ? `${BASE_URL}/auth/request-otp`   // email → hit live server
    : "http://localhost:4000/auth/request-otp" // phone → keep localhost

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(target),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || "Failed to request OTP")
  }

  return res.json() // { message }
}

export async function verifyOtp(data: { otp: string; phone?: string; email?: string }) {
  const url = data.email
    ? `${BASE_URL}/auth/verify-otp`   // email → hit live server
    : "http://localhost:4000/auth/verify-otp" // phone → keep localhost

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || "Failed to verify OTP")
  }

  return res.json() // { message, token }
}
