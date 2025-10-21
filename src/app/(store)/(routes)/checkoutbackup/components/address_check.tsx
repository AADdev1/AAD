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
      <Card className="md:col-span-1">
         <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold">Select Address</h2>

            {addresses.map((addr) => (
               <label
                  key={addr.id}
                  className="flex items-center gap-2 cursor-pointer"
               >
                  <input
                     type="radio"
                     name="address"
                     value={addr.id}
                     checked={selected === addr.id}
                     onChange={() => setSelected(addr.id)}
                  />
                  <span>
                     {addr.address}, {addr.city}, {addr.postalCode} <br />
                     {addr.phone}
                  </span>
               </label>
            ))}

            {/* New Address Option */}
            <label className="flex items-center gap-2 cursor-pointer">
               <input
                  type="radio"
                  name="address"
                  value="new"
                  checked={selected === 'new'}
                  onChange={() => setSelected('new')}
               />
               <span>Add New Address</span>
            </label>

            {selected === 'new' && (
               <div className="space-y-2 mt-3">
                  <div>
                     <Input
                        placeholder="Address"
                        value={newAddress.address}
                        onChange={(e) =>
                           setNewAddress({ ...newAddress, address: e.target.value })
                        }
                     />
                     {errors.address && (
                        <p className="text-red-500 text-sm">{errors.address}</p>
                     )}
                  </div>

                  <div>
                     <Input
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) =>
                           setNewAddress({ ...newAddress, city: e.target.value })
                        }
                     />
                     {errors.city && (
                        <p className="text-red-500 text-sm">{errors.city}</p>
                     )}
                  </div>

                  <div>
                     <Input
                        placeholder="Phone"
                        value={newAddress.phone}
                        onChange={(e) =>
                           setNewAddress({ ...newAddress, phone: e.target.value })
                        }
                     />
                     {errors.phone && (
                        <p className="text-red-500 text-sm">{errors.phone}</p>
                     )}
                  </div>

                  <div>
                     <Input
                        placeholder="Postal Code"
                        value={newAddress.postalCode}
                        onChange={(e) =>
                           setNewAddress({
                              ...newAddress,
                              postalCode: e.target.value,
                           })
                        }
                     />
                     {errors.postalCode && (
                        <p className="text-red-500 text-sm">{errors.postalCode}</p>
                     )}
                  </div>

                  <button
                     type="button"
                     onClick={handleSaveNewAddress}
                     className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                     Save Address
                  </button>
               </div>
            )}
         </CardContent>
      </Card>
   )
}
