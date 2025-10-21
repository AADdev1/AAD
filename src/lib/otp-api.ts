export async function requestOtp(target: { phone?: string; email?: string }) {
  const res = await fetch("http://localhost:4000/auth/request-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(target),
  })
  if (!res.ok) throw new Error("Failed to request OTP")
  return res.json() // { message, requestId }
}

export async function verifyOtp(data: { otp: string; phone?: string; email?: string }) {
  const res = await fetch("http://localhost:4000/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to verify OTP")
  return res.json() // { message, token }
}


// adding comments to checck commit 