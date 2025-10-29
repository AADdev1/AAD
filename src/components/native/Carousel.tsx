'use client'

import { cn } from '@/lib/utils'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function Carousel({ images }: { images: string[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()])
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    function selectHandler() {
      const index = emblaApi.selectedScrollSnap()
      setSelectedIndex(index || 0)
    }
    emblaApi.on('select', selectHandler)
    return () => emblaApi.off('select', selectHandler)
  }, [emblaApi])

  // 🔁 reinitialize when images change or load completes
  useEffect(() => {
    if (!emblaApi) return
    const timer = setTimeout(() => emblaApi.reInit(), 500)
    return () => clearTimeout(timer)
  }, [emblaApi, images])

  return (
    <>
      <div className="overflow-hidden rounded-lg" ref={emblaRef}>
        <div className="flex">
          {images.map((src, i) => (
            <div className="relative h-96 flex-[0_0_100%]" key={i}>
              <Image
                src={src}
                alt={`banner-${i}`}
                fill
                unoptimized
                priority={i === 0}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      <Dots itemsLength={images.length} selectedIndex={selectedIndex} />
    </>
  )
}

type Props = {
  itemsLength: number
  selectedIndex: number
}

const Dots = ({ itemsLength, selectedIndex }: Props) => {
  const arr = new Array(itemsLength).fill(0)
  return (
    <div className="flex gap-1 justify-center -translate-y-8">
      {arr.map((_, index) => {
        const selected = index === selectedIndex
        return (
          <div
            className={cn({
              'h-3 w-3 rounded-full transition-all duration-300 bg-primary-foreground':
                true,
              'opacity-50': !selected,
            })}
            key={index}
          />
        )
      })}
    </div>
  )
}
