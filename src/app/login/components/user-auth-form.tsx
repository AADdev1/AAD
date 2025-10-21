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

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Sign-up state
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')

  // OTP state
  const [otpStep, setOtpStep] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [requestId, setRequestId] = useState<string | null>(null)

  // Errors
  const [error, setError] = useState('')

  const isPasswordValid = (password: string) => {
    if (!password) return false
    const re =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return re.test(password)
  }


  const handleLogin = async () => {
  setError('')

  if (!loginIdentifier || !loginPassword) {
    setError('Please fill all fields')
    return
  }

  // Detect email or phone automatically
  const isEmail = isEmailValid(loginIdentifier)
  const isPhone = isIndianPhoneNumberValid(loginIdentifier)

  if (!isEmail && !isPhone) {
    setError('Please enter a valid email or Indian mobile number')
    return
  }

  setIsLoading(true)
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: loginIdentifier.trim(),
        password: loginPassword,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Login failed')
    } else {
      // Optional: You can differentiate for analytics or UX here
      // console.log(isPhone ? 'Logged in via mobile' : 'Logged in via email')
      window.location.assign('/')
    }
  } catch (err) {
    console.error('LOGIN ERROR:', err)
    setError('Internal server error')
  } finally {
    setIsLoading(false)
  }
}



  const handleSignup = async () => {
    setError('')

    if (!signupName || !signupEmail || !signupPassword) {
      setError('Please fill all required fields')
      return
    }

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!isPasswordValid(signupPassword)) {
      setError(
        'Password must be 8+ chars, include uppercase, lowercase, number, special char'
      )
      return
    }

    if (signupEmail && !isEmailValid(signupEmail)) {
      setError('Invalid email')
      return
    }

    setIsLoading(true)
    try {
      // Trigger OTP send
      const response = await fetch('/api/auth/otp/email/try', {
        method: 'POST',
        body: JSON.stringify({ email: signupEmail }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'OTP send failed')
      } else {
        setRequestId(data.requestId)
        setOtpStep(true)
      }
    } catch (err) {
      console.error(err)
      setError('Internal server error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError('')
    if (!otpCode || !signupEmail ) {
      setError('OTP and email required')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/otp/email/verify', {
        method: 'POST',
        body: JSON.stringify({
          otp: otpCode,
          email: signupEmail,
          name: signupName,
          phone: signupPhone,
          password: signupPassword,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'OTP verification failed')
      } else {
        window.location.assign('/')
      }
    } catch (err) {
      console.error(err)
      setError('Internal server error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      {/* Tabs */}
      {!otpStep && (
        <div className="flex justify-center space-x-4">
          <button
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === 'login'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground'
            }`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === 'signup'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground'
            }`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-red-700 text-sm">{error}</p>}

      {/* Login Form */}
      {!otpStep && activeTab === 'login' && (
        <div className="grid gap-4">
          <div className="grid gap-1">
            <Label>Email or Phone</Label>
            <Input
              type="text"
              placeholder="Email or Phone"
              value={loginIdentifier}
              onChange={(e) => setLoginIdentifier(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-1">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end text-sm mt-1">
            <Link
              href="/login/forgot-password"
              className="text-primary underline hover:text-primary/80"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full mt-2"
          >
            {isLoading && <Loader className="mr-2 h-4 animate-spin" />}
            Login
          </Button>
        </div>
      )}

      {/* Signup Form */}
      {!otpStep && activeTab === 'signup' && (
        <div className="grid gap-4">
          <div className="grid gap-1">
            <Label>Name</Label>
            <Input
              type="text"
              placeholder="Your name"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-1">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-1">
            <Label>Phone</Label>
            <Input
              type="tel"
              placeholder="Phone"
              value={signupPhone}
              onChange={(e) => setSignupPhone(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-1">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-1">
            <Label>Confirm Password</Label>
            <Input
              type="password"
              placeholder="Confirm Password"
              value={signupConfirmPassword}
              onChange={(e) => setSignupConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handleSignup}
            disabled={isLoading}
            className="w-full mt-2"
          >
            {isLoading && <Loader className="mr-2 h-4 animate-spin" />}
            Sign Up
          </Button>
        </div>
      )}

      {/* OTP Step */}
      {otpStep && (
        <div className="grid gap-4">
          <div className="grid gap-1">
            <Label>Email</Label>
            <Input type="email" value={signupEmail} disabled />
          </div>

          <div className="grid gap-1">
            <Label>OTP Code</Label>
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handleVerifyOtp}
            disabled={isLoading}
            className="w-full mt-2"
          >
            {isLoading && <Loader className="mr-2 h-4 animate-spin" />}
            Verify OTP
          </Button>
        </div>
      )}
    </div>
  )
}
