'use client'

import { Button } from '@/components/ui/button'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { UserWithIncludes } from '@/types/prisma'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const formSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^(\+91\d{10}|\d{10})$/,'Invalid mobile number.').optional(),
})

type UserFormValues = z.infer<typeof formSchema>

interface UserFormProps {
  initialData: UserWithIncludes | null
}

type VerificationState = 'idle' | 'otp_requested' | 'verifying' | 'verified'

export const UserForm: React.FC<UserFormProps> = ({ initialData }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formDisabled, setFormDisabled] = useState(false) // 🔹 new state

  // OTP states
  const [emailState, setEmailState] = useState<VerificationState>('idle')
  const [phoneState, setPhoneState] = useState<VerificationState>('idle')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpPhone, setOtpPhone] = useState('')

  const toastMessage = 'Profile updated.'
  const action = 'Save changes'

  const defaultValues: UserFormValues = initialData ?? {
    name: '',
    phone: '',
    email: '',
  }

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // 🔹 Request OTP
  const requestOtp = async (field: 'email' | 'phone', value: string) => {
    try {
      setLoading(true)
      setFormDisabled(true) // 🔹 disable entire form once OTP requested

      const res = await fetch(`/api/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'OTP request failed')

      toast.success(`OTP sent to ${field}`)
      if (field === 'email') setEmailState('otp_requested')
      if (field === 'phone') setPhoneState('otp_requested')
    } catch (error: any) {
      toast.error(error.message || 'Failed to request OTP.')
      setFormDisabled(false) // re-enable if request fails
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Verify OTP
  const verifyOtp = async (field: 'email' | 'phone', value: string, otp: string) => {
    try {
      setLoading(true)
      if (field === 'email') setEmailState('verifying')
      if (field === 'phone') setPhoneState('verifying')

      const res = await fetch(`/api/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value, otp, field }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'OTP verification failed')

      toast.success(`${field} verified and updated successfully`)

      if (field === 'email') setEmailState('verified')
      if (field === 'phone') setPhoneState('verified')

      setFormDisabled(false) // 🔹 re-enable form after success
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'OTP verification failed.')
      if (field === 'email') setEmailState('otp_requested')
      if (field === 'phone') setPhoneState('otp_requested')
      // keep form disabled until user verifies successfully
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: UserFormValues) => {
    // Name can be updated directly
    if (data.name && data.name !== initialData?.name) {
      try {
        setLoading(true)
        const res = await fetch(`/api/profile`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name }),
        })

        if (!res.ok) throw new Error('Failed to update name')

        toast.success(toastMessage)
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    // Email → request OTP
    if (data.email && data.email !== initialData?.email) {
      await requestOtp('email', data.email)
    }

    // Phone → request OTP
    if (data.phone && data.phone !== initialData?.phone) {
      await requestOtp('phone', data.phone)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-2 w-full"
      >
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  disabled={loading || formDisabled}
                  placeholder="Full Name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Field + OTP */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  disabled={loading || formDisabled || emailState !== 'idle'}
                  placeholder="Email"
                  {...field}
                />
              </FormControl>
              {emailState === 'otp_requested' && (
                <div className="mt-2 flex space-x-2">
                  <Input
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    placeholder="Enter OTP"
                  />
                  <Button
                    type="button"
                    disabled={loading}
                    onClick={() => verifyOtp('email', field.value, otpEmail)}
                  >
                    Verify
                  </Button>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Field + OTP */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input
                  disabled={loading || formDisabled || phoneState !== 'idle'}
                  placeholder="Phone"
                  {...field}
                />
              </FormControl>
              {phoneState === 'otp_requested' && (
                <div className="mt-2 flex space-x-2">
                  <Input
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value)}
                    placeholder="Enter OTP"
                  />
                  <Button
                    type="button"
                    disabled={loading}
                    onClick={() => verifyOtp('phone', field.value, otpPhone)}
                  >
                    Verify
                  </Button>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={loading || formDisabled} className="ml-auto" type="submit">
          {action}
        </Button>
      </form>
    </Form>
  )
}
