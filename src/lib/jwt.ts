import { SignJWT, jwtVerify } from "jose"

const secretKey = process.env.JWT_SECRET_KEY || "default_dev_secret"
if (!secretKey) {
  throw new Error("JWT_SECRET_KEY is not defined in environment variables")
}

const secret = new TextEncoder().encode(secretKey)

export async function signJWT(payload: object) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret)
}

export async function verifyJWT<T>(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return payload as T
}
