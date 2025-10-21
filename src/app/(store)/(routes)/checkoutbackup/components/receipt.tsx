'use client'

import { useEffect, useState } from 'react'
import { Separator } from '@/components/native/separator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import Script from 'next/script'
import { isVariableValid } from '@/lib/utils'
import { useAuthenticated } from '@/hooks/useAuthentication'

interface ReceiptProps {
  cartItems?: any[]
  loading?: boolean
}

export function Receipt({ cartItems = [], loading = false }: ReceiptProps) {
  const { authenticated, user, loading: authLoading } = useAuthenticated()


  const [addresses, setAddresses] = useState<any[]>([])
  const [selected, setSelected] = useState<string | 'new'>('')
  const [newAddress, setNewAddress] = useState({
    address: '',
    city: '',
    phone: '',
    postalCode: '',
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Fetch user addresses
  useEffect(() => {
    async function fetchAddresses() {
      try {
        const res = await fetch('/api/addresses', {
          headers: { 'X-USER-ID': 'usr1' }, // Replace with dynamic user ID
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
    if (!/^[6-9]\d{9}$/.test(addr.phone))
      newErrors.phone = 'Enter a valid 10-digit Indian phone number'
    if (!/^\d{6}$/.test(addr.postalCode))
      newErrors.postalCode = 'Enter a valid 6-digit postal code'

    const duplicate = addresses.find(
      (a) =>
        a.address.trim().toLowerCase() === addr.address.trim().toLowerCase() &&
        a.city.trim().toLowerCase() === addr.city.trim().toLowerCase() &&
        a.phone.trim() === addr.phone.trim() &&
        a.postalCode.trim() === addr.postalCode.trim()
    )
    if (duplicate) newErrors.address = 'This address already exists'

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

  function calculatePayableCost() {
    let totalAmount = 0,
      discountAmount = 0

    if (isVariableValid(cartItems)) {
      for (const item of cartItems) {
        totalAmount += item?.count * item?.product?.price
        discountAmount += item?.count * item?.product?.discount
      }
    }

    const payableAmount = totalAmount - discountAmount
    return {
      totalAmount: totalAmount.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      payableAmount: payableAmount.toFixed(2),
    }
  }

  const costs = calculatePayableCost()

  async function handleCheckout() {
    try {
      console.log('handleCheckout triggered, selected address:', selected)

      if (!selected) {
        alert('⚠️ Please select or add an address before proceeding to payment.')
        return
      }

      let addressId = selected

      // If new address selected → validate & save
      if (selected === 'new') {
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
          addressId = saved.id
        }
      }

      // Prepare product list for backend
      const productList = cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.count,
      }))

      // Create Razorpay Order with product list instead of amount
      const resOrder = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: productList,
          userId: user?.id || 'usr1', // <-- sending products & quantities
          currency: 'INR',
          receipt: `receipt#${Math.floor(Math.random() * 1000000)}`,
          notes: { addressId },
        }),
      })

      const orderData = await resOrder.json()
      const order = orderData?.razorpayOrder;

      if (!order?.id) {
        alert('Failed to create order');
        console.error('Unexpected orderData:', orderData);
        return;
      }

      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount, // backend should calculate amount from products
        currency: orderData.currency,
        name: 'My Store',
        description: 'Order Payment',
        order_id: orderData.id,
        prefill: {
          name: user?.name || 'Guest',
          email: user?.email || 'guest@example.com',
          contact: user?.phone || '9999999999',
        },
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          })
          const verifyData = await verifyRes.json()

          if (verifyData.success) {
            alert('✅ Payment successful & verified!')
            console.log('🎉 Payment verified, creating order...')

            const orderRes = await fetch('/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-USER-ID': 'usr1',
              },
              body: JSON.stringify({ addressId, products: productList }),
            })
            console.log('Order response:', await orderRes.json())
          } else {
            alert('❌ Payment verification failed!')
          }
        },
        theme: { color: '#3399cc' },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error('Checkout Error:', err)
      alert('Something went wrong during checkout.')
    }
  }



  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <Card className={loading ? 'animate-pulse' : ''}>
        <CardHeader className="p-4 pb-0">
          <h2 className="font-bold tracking-tight">Checkout</h2>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Address Section */}
          <div>
            <h3 className="font-semibold mb-2">Select Address</h3>
            {addresses.map((addr) => (
              <label key={addr.id} className="flex items-center gap-2 cursor-pointer">
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

            <label className="flex items-center gap-2 cursor-pointer mt-2">
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
                <Input
                  placeholder="Address"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                />
                {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}

                <Input
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                />
                {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}

                <Input
                  placeholder="Phone"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

                <Input
                  placeholder="Postal Code"
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                />
                {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode}</p>}

                <Button onClick={handleSaveNewAddress} className="w-full">Save Address</Button>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Cart Summary */}
          <div className="flex justify-between">
            <p>Total Amount</p>
            <h3>₹{costs.totalAmount}</h3>
          </div>
          <div className="flex justify-between">
            <p>Discount</p>
            <h3>₹{costs.discountAmount}</h3>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <p>Payable</p>
            <h3>₹{costs.payableAmount}</h3>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            disabled={!isVariableValid(cartItems) || cartItems.length === 0 || loading}
            className="w-full"
            onClick={handleCheckout}
          >
            Proceed to Pay
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}




