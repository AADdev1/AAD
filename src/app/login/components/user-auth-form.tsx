'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader } from 'lucide-react'
import { isEmailValid, isIndianPhoneNumberValid } from '@/lib/utils'

export function UserAuthForm() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailTempToken, setEmailTempToken] = useState('')
  const [phoneTempToken, setPhoneTempToken] = useState('')

  /* ---------- LOGIN ---------- */
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  /* ---------- SIGNUP ---------- */
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')

  /* ---------- EMAIL OTP ---------- */
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [emailOtp, setEmailOtp] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)

  /* ---------- PHONE OTP ---------- */
  const [phoneOtpSent, setPhoneOtpSent] = useState(false)
  const [phoneOtp, setPhoneOtp] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)

  /* ---------- LOGIN ---------- */
  const handleLogin = async () => {
    setError('')
    if (!loginIdentifier || !loginPassword) {
      setError('Please fill all fields')
      return
    }

    if (
      !isEmailValid(loginIdentifier) &&
      !isIndianPhoneNumberValid(loginIdentifier)
    ) {
      setError('Invalid email or phone')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: loginIdentifier,
          password: loginPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) setError(data.error || 'Login failed')
      else window.location.assign('/')
    } catch {
      setError('Internal server error')
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------- SEND OTP ---------- */
  const sendEmailOtp = async () => {
    setError('')
    if (!isEmailValid(signupEmail)) {
      setError('Invalid email')
      return
    }

    const res = await fetch('/api/auth/otp/email/try', {
      method: 'POST',
      body: JSON.stringify({ email: signupEmail, phone: signupPhone }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to send email OTP')
      return
    }

    setEmailOtpSent(true)
  }

  const sendPhoneOtp = async () => {
    setError('')
    if (!isIndianPhoneNumberValid(signupPhone)) {
      setError('Invalid phone number')
      return
    }

    const res = await fetch('/api/auth/otp/phone/try', {
      method: 'POST',
      body: JSON.stringify({ phone: signupPhone, email: signupEmail }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to send phone OTP')
      return
    }

    setPhoneOtpSent(true)
  }

  /* ---------- VERIFY OTP ---------- */
  const verifyEmailOtp = async () => {
    setError('')
    const res = await fetch('/api/auth/otp/email/verify', {
      method: 'POST',
      body: JSON.stringify({
        otp: emailOtp,
        email: signupEmail,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Email OTP verification failed')
      return
    }

    console.log("EMAIL TEMP TOKEN:", data.tempToken) //temporary console login
    setEmailTempToken(data.tempToken)   // 🔥 store token
    setEmailVerified(true)
  }

  const verifyPhoneOtp = async () => {
    setError('')
    const res = await fetch('/api/auth/otp/phone/verify', {
      method: 'POST',
      body: JSON.stringify({
        otp: phoneOtp,
        phone: signupPhone,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Phone OTP verification failed')
      return
    }

    setPhoneTempToken(data.tempToken)   // 🔥 store token
    setPhoneVerified(true)
  }

const handleSignup = async () => {
  setError('')

  if (!signupPassword || signupPassword !== signupConfirmPassword) {
    setError('Passwords do not match')
    return
  }

  console.log("EMAIL VERIFIED:", emailVerified) //temporary
console.log("EMAIL TEMP TOKEN:", emailTempToken)  //temporary
  
const res = await fetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: signupName,
      email: emailVerified ? signupEmail : undefined,
      phone: phoneVerified ? signupPhone : undefined,
      emailTempToken,
      phoneTempToken,
      password: signupPassword,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    setError(data.error || 'Signup failed')
    return
  }

  window.location.assign('/')
}
  

/* ---------- UI ---------- */
  return (
    <div className="grid gap-6">
      <div className="flex justify-center gap-4">
        <button onClick={() => setActiveTab('login')}>Login</button>
        <button onClick={() => setActiveTab('signup')}>Sign Up</button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {activeTab === 'login' && (
        <div className="grid gap-3">
          <Input
            placeholder="Email or Phone"
            value={loginIdentifier}
            onChange={(e) => setLoginIdentifier(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <Link href="/login/forgot-password" className="text-sm underline">
            Forgot password?
          </Link>
          <Button onClick={handleLogin} disabled={isLoading}>
            {isLoading && <Loader className="mr-2 h-4 animate-spin" />}
            Login
          </Button>
        </div>
      )}

      {activeTab === 'signup' && (
        <div className="grid gap-4">
          <Input placeholder="Name" onChange={(e) => setSignupName(e.target.value)} />

          {/* EMAIL */}
          <div className="grid gap-1">
            <Label>Email</Label>
            <div className="flex gap-2">
              <Input
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                disabled={emailVerified}
              />
              {!emailOtpSent && !emailVerified && (
                <Button variant="outline" onClick={sendEmailOtp}>
                  Send OTP
                </Button>
              )}
            </div>

            {emailOtpSent && !emailVerified && (
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Enter OTP"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                />
                <Button onClick={verifyEmailOtp}>Verify OTP</Button>
              </div>
            )}
          </div>

          {/* PHONE */}
          <div className="grid gap-1">
            <Label>Phone</Label>
            <div className="flex gap-2">
              <Input
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value)}
                disabled={phoneVerified}
              />
              {!phoneOtpSent && !phoneVerified && (
                <Button variant="outline" onClick={sendPhoneOtp}>
                  Send OTP
                </Button>
              )}
            </div>

            {phoneOtpSent && !phoneVerified && (
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Enter OTP"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value)}
                />
                <Button onClick={verifyPhoneOtp}>Verify OTP</Button>
              </div>
            )}
          </div>

          <Input
            type="password"
            placeholder="Password"
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={signupConfirmPassword}
            onChange={(e) => setSignupConfirmPassword(e.target.value)}
          />

          {(emailVerified || phoneVerified) && (
            <Button className="mt-2"  onClick={handleSignup}>
              Complete Signup
            </Button>
          )}

        </div>
      )}
    </div>
  )
}
