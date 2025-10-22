'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-hot-toast'

const formSchema = z.object({
  purpose: z.string().min(1, 'Please select a purpose.'),
  subCategory: z.string().min(1, 'Please select a subcategory.'),
  message: z.string().min(5, 'Message must be at least 5 characters long.'),
})

export default function ContactUsPage() {
  const [loading, setLoading] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purpose: '',
      subCategory: '',
      message: '',
    },
  })

  // Purpose → Subcategory map
  const subCategoryOptions: Record<string, string[]> = {
    Grievance: ['Delivery Issue', 'Payment Issue', 'Staff Behavior', 'Other'],
    Suggestion: ['Website Feedback', 'Product Improvement', 'New Collection Idea'],
    'Product Enquiry': ['Stock Availability', 'Custom Order', 'Pricing', 'Other'],
    'Order Issue': ['Delay', 'Damaged', 'Wrong Item', 'Refund Pending'],
    Other: ['Miscellaneous'],
  }

  const purpose = form.watch('purpose')

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-USER-ID': '123', // 🔹 Replace with real user header logic later
        },
        body: JSON.stringify(values),
      })

      if (!res.ok) throw new Error('Failed to send message.')

      toast.success('Your message has been submitted successfully!')
      form.reset()
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-muted-foreground/5 rounded-md">
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-semibold mb-2">Contact Us</h1>
        <p className="text-muted-foreground">
          We’re here to help! Reach out through the contact details below or submit your concern using the form.
        </p>

        {/* Contact Information */}
        <div className="bg-white/70 dark:bg-gray-900/40 rounded-xl p-4 shadow-sm border">
          <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>📧 Email: <a href="mailto:allaboutdiecastcare@gmail.com" className="text-blue-600">allaboutdiecastcare@gmail.com</a></li>
            <li>📞 Call: +91 98765 43210</li>
            <li>💬 WhatsApp: <a href="https://wa.me/918233208359" className="text-green-600">Chat with us</a></li>
            <li>🏢 Address: Gala No. 7, Mumbai, Maharashtra, India</li>
            <li>🕒 Working Hours: Mon–Sat, 10 AM – 7 PM</li>
          </ul>
        </div>

        {/* Contact Form */}
        <div className="bg-white/70 dark:bg-gray-900/40 rounded-xl p-4 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Send us a message</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Purpose Dropdown */}
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Purpose" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.keys(subCategoryOptions).map((key) => (
                          <SelectItem key={key} value={key}>{key}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subcategory Dropdown */}
              <FormField
                control={form.control}
                name="subCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!purpose}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={purpose ? 'Select Subcategory' : 'Select Purpose first'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(subCategoryOptions[purpose] || []).map((sub) => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Message Box */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your message here..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
