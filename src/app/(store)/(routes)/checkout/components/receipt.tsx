'use client'

import { useEffect, useState } from 'react'
import { Separator } from '@/components/native/separator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import Script from 'next/script'
import { isVariableValid } from '@/lib/utils'
import { useAuthenticated } from '@/hooks/useAuthentication'
import { useRouter } from 'next/navigation' // ✅ Added import

interface ReceiptProps {
  cartItems?: any[]
  loading?: boolean
  handleCheckout: () => void   // ✅ Added
}

export function Receipt({ cartItems = [], loading = false }: ReceiptProps) {
  const { authenticated, user, loading: authLoading } = useAuthenticated()
  const router = useRouter() // ✅ Added

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
          headers: { 'X-USER-ID': user?.id || 'usr1' },
        })
        if (res.ok) {
          const data = await res.json()
          setAddresses(data)
        } else {
          console.error('Failed to fetch addresses', await res.text())
        }
      } catch (err) {
        console.error('Error fetching addresses', err)
      }
    }
    fetchAddresses()
  }, [user?.id])

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

    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-USER-ID': user?.id || 'usr1',
        },
        body: JSON.stringify(newAddress),
      })
      if (res.ok) {
        const saved = await res.json()
        setAddresses([...addresses, saved])
        setSelected(saved.id)
        setNewAddress({ address: '', city: '', phone: '', postalCode: '' })
        setErrors({})
      } else {
        console.error('Failed to save address', await res.text())
      }
    } catch (err) {
      console.error('Error saving address', err)
    }
  }

  const DELIVERY_CHARGE = 100


  function calculatePayableCost() {
  let totalAmount = 0
  let discountAmount = 0

  if (isVariableValid(cartItems)) {
    for (const item of cartItems) {
      totalAmount += Number(item?.count || 0) * Number(item?.product?.price || 0)
      discountAmount += Number(item?.count || 0) * Number(item?.product?.discount || 0)
    }
  }

  const subtotal = totalAmount - discountAmount
  const deliveryCharge = subtotal > 0 ? DELIVERY_CHARGE : 0
  const payableAmount = subtotal + deliveryCharge

  return {
    totalAmount: totalAmount.toFixed(2),
    discountAmount: discountAmount.toFixed(2),
    deliveryCharge: deliveryCharge.toFixed(2),
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
            'X-USER-ID': user?.id || 'usr1',
          },
          body: JSON.stringify(newAddress),
        })
        if (res.ok) {
          const saved = await res.json()
          addressId = saved.id
          setAddresses((prev) => [...prev, saved])
          setSelected(saved.id)
        } else {
          alert('Failed to save address. Try again.')
          return
        }
      }

      // Prepare product list for backend
      const productList = cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.count,
      }))

      // Create Razorpay Order - server will compute final amount
      const resOrder = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: productList,
          userId: user?.id,
          addressId,
          currency: 'INR',
          receipt: `receipt#${Math.floor(Math.random() * 1000000)}`,
          notes: { addressId },
        }),
      })

      const orderData = await resOrder.json()
      if (!resOrder.ok) {
        console.error('Order creation failed:', orderData)
        alert('Failed to create order. Try again.')
        return
      }

      const razorpayOrder = orderData?.razorpayOrder
      if (!razorpayOrder || !razorpayOrder.id) {
        console.error('Invalid razorpay order returned:', orderData)
        alert('Failed to create order with payment provider.')
        return
      }

      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || orderData.currency || 'INR',
        name: 'My Store',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        prefill: {
          name: user?.name || 'Guest',
          email: user?.email || 'guest@example.com',
          contact: user?.phone || '9999999999',
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderItemsData: orderData?.order?.items || [],
                orderId: orderData?.orderId,
                userId: user?.id,
                payable: Number(costs.payableAmount),
                fee: 0,
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyRes.ok && verifyData.success) {
             

              // ✅ Redirect after verification
              if (orderData?.orderId) {
                router.push(`/profile/orders/${orderData.orderId}`)
              } else {
                console.warn('⚠️ orderId missing, redirecting to orders list')
                router.push('/profile/orders')
              }
            } else {
              console.error('Verification failed', verifyData)
              alert('❌ Payment verification failed!')
            }
          } catch (err) {
            console.error('Error during payment verification/save', err)
            alert('Something went wrong after payment. Check console.')
          }
        },
        modal: {
          ondismiss: function () {
            console.log('Checkout dismissed')
          },
        },
        theme: { color: '#3399cc' },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed', response)
        alert('❌ Payment failed: ' + (response?.error?.description || 'Unknown error'))
      })
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

                <Button onClick={handleSaveNewAddress} className="w-full">
                  Save Address
                </Button>
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
          <div className="flex justify-between">
            <p>Delivery Charges</p>
            <h3>₹{costs.deliveryCharge}</h3>
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
