import crypto from "crypto"

export function generateTempToken() {
  return crypto.randomBytes(32).toString("hex")
}

export function hashTempToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export function isExpired(date: Date, minutes = 5) {
  return Date.now() - date.getTime() > minutes * 60 * 1000
}
