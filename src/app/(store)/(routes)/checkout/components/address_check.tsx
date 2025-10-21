'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function Address() {
   const [addresses, setAddresses] = useState<any[]>([])
   const [selected, setSelected] = useState<string | 'new'>('')
   const [newAddress, setNewAddress] = useState({
      address: '',
      city: '',
      phone: '',
      postalCode: '',
   })
   const [errors, setErrors] = useState<{ [key: string]: string }>({})

   useEffect(() => {
      async function fetchAddresses() {
         try {
            const res = await fetch('/api/addresses', {
               headers: {
                  'X-USER-ID': 'usr1', // replace with real logged-in user
               },
            })
            if (res.ok) {
               const data = await res.json()
               setAddresses(data)
            }
         } catch (err) {
            console.error(err)
         }
      }
      fetchAddresses()
   }, [])

   function validateAddress(addr: typeof newAddress) {
      const newErrors: { [key: string]: string } = {}

      if (!addr.address.trim()) newErrors.address = 'Address is required'
      if (!addr.city.trim()) newErrors.city = 'City is required'

      if (!/^[6-9]\d{9}$/.test(addr.phone)) {
         newErrors.phone = 'Enter a valid 10-digit Indian phone number'
      }

      if (!/^\d{6}$/.test(addr.postalCode)) {
         newErrors.postalCode = 'Enter a valid 6-digit Indian postal code'
      }

      // Duplicate validation
      const duplicate = addresses.find(
         (a) =>
            a.address.trim().toLowerCase() === addr.address.trim().toLowerCase() &&
            a.city.trim().toLowerCase() === addr.city.trim().toLowerCase() &&
            a.phone.trim() === addr.phone.trim() &&
            a.postalCode.trim() === addr.postalCode.trim()
      )
      if (duplicate) {
         newErrors.address = 'This address already exists'
      }

      return newErrors
   }

   async function handleSaveNewAddress() {
      const validationErrors = validateAddress(newAddress)
      if (Object.keys(validationErrors).length > 0) {
         setErrors(validationErrors)
         return
      }

      const res = await fetch('/api/addresses', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            'X-USER-ID': 'usr1',
         },
         body: JSON.stringify(newAddress),
      })
      if (res.ok) {
         const saved = await res.json()
         setAddresses([...addresses, saved])
         setSelected(saved.id)
         setNewAddress({ address: '', city: '', phone: '', postalCode: '' })
         setErrors({})
      }
   }

   return (
      <Card >
        
      </Card>
   )
}
