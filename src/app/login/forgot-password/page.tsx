'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader } from 'lucide-react'
import { isEmailValid, isIndianPhoneNumberValid } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const isPasswordValid = (password: string) => {
    if (!password) return false
    const re =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return re.test(password)
  }

  const handleSendOtp = async () => {
    setError('')
    setMessage('')

    if (!identifier) {
      setError('Email or phone is required')
      return
    }

    if (!isEmailValid(identifier) && !isIndianPhoneNumberValid(identifier)) {
      setError('Invalid email or phone')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password/otp/send', {
        method: 'POST',
        body: JSON.stringify({ identifier }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send OTP')
      } else {
        setMessage('OTP sent successfully')
        setStep('verify')
      }
    } catch (err: any) {
      console.error(err)
      setError('Internal server error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError('')
    setMessage('')
    setSuccessMessage('')
    setShowSuccess(false)

    if (!otp || !newPassword || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!isPasswordValid(newPassword)) {
      setError(
        'Password must be 8+ chars, include uppercase, lowercase, number, special char'
      )
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ identifier, otp, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'OTP verification failed')
      } else {
        // ✅ Show success message and auto redirect
        setSuccessMessage('Password updated successfully! Redirecting...')
        setShowSuccess(true)

        // Fade out message
        setTimeout(() => setShowSuccess(false), 1800)

        // Redirect after 2s
        setTimeout(() => window.location.assign('/'), 2000)
      }
    } catch (err: any) {
      console.error(err)
      setError('Internal server error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
  <div className="min-h-screen py-12">
  <div className="container mx-auto p-4 max-w-md">
    <h1 className="text-3xl font-semibold mb-6">Forgot Password</h1>

    {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
    {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
    {showSuccess && (
      <p className="text-green-600 text-sm mb-4 transition-opacity duration-500 opacity-100">
        {successMessage}
      </p>
    )}

    {/* Request OTP Step */}
    {step === 'request' && (
      <div className="grid gap-4">
        <div className="grid gap-1">
          <Label>Email or Phone</Label>
          <Input
            type="text"
            placeholder="Enter email or phone"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={handleSendOtp}
          disabled={isLoading}
          className="w-full mt-2"
        >
          {isLoading && <Loader className="mr-2 h-4 animate-spin" />}
          Send OTP
        </Button>
      </div>
    )}

    {/* Verify OTP and Update Password Step */}
    {step === 'verify' && (
      <div className="grid gap-4">
        <div className="grid gap-1">
          <Label>OTP</Label>
          <Input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-1">
          <Label>New Password</Label>
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-1">
          <Label>Confirm Password</Label>
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={handleVerifyOtp}
          disabled={isLoading}
          className="w-full mt-2"
        >
          {isLoading && <Loader className="mr-2 h-4 animate-spin" />}
          Verify & Update
        </Button>
      </div>
    )}

    {/* Back to Login Link */}
    <div className="mt-4 text-center">
      <Link
        href="/login"
        className="text-primary underline hover:text-primary/80 text-sm"
      >
        ← Back to Login
      </Link>
    </div>
  </div>
</div>

  )
}
