'use client'

import { Check, Truck, Package, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { key: 'CONFIRMED', label: 'Order Confirmed', icon: Check },
  { key: 'PICKED', label: 'Picked by Courier', icon: User },
  { key: 'IN_TRANSIT', label: 'On the Way', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Package },
] as const

type Props = {
  status: string
}

export function OrderTimeline({ status }: Props) {
  const currentIndex = STEPS.findIndex((s) => s.key === status)

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">

        {/* Background Line */}
        <div className="absolute top-5 left-0 w-full h-[3px] bg-muted" />

        {/* Active Line */}
        {currentIndex >= 0 && (
          <div
            className="absolute top-5 left-0 h-[3px] bg-primary transition-all duration-500"
            style={{
              width: `${(currentIndex / (STEPS.length - 1)) * 100}%`,
            }}
          />
        )}

        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const Icon = step.icon

          return (
            <div
              key={step.key}
              className="flex flex-col items-center relative z-10 flex-1"
            >
              {/* Circle */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background transition-all duration-300',
                  isCompleted &&
                    'bg-primary border-primary text-primary-foreground',
                  isCurrent &&
                    'border-primary text-primary bg-background shadow-md scale-110',
                  !isCompleted &&
                    !isCurrent &&
                    'border-muted-foreground/30 text-muted-foreground'
                )}
              >
                <Icon size={18} />
              </div>

              {/* Label */}
              <p
                className={cn(
                  'text-xs mt-3 text-center transition-colors',
                  isCurrent && 'text-primary font-medium',
                  isCompleted && 'text-foreground',
                  !isCompleted && !isCurrent && 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
