'use client'

import { cn } from '@/lib/utils'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function MobileCarousel({ images }: { images: string[] }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()])
    const [selectedIndex, setSelectedIndex] = useState(0)


    useEffect(() => {
        if (!emblaApi) return

        const selectHandler = () => {
            const index = emblaApi.selectedScrollSnap()
            setSelectedIndex(index || 0)
        }

        emblaApi.on('select', selectHandler)

        // ✅ Explicitly return void cleanup
        return () => {
            emblaApi.off('select', selectHandler)
        }
    }, [emblaApi])



    useEffect(() => {
        if (!emblaApi) return
        const timer = setTimeout(() => emblaApi.reInit(), 500)
        return () => clearTimeout(timer)
    }, [emblaApi, images])

    return (
        <>
            <div className="overflow-hidden rounded-md" ref={emblaRef}>
                <div className="flex">
                    {images.map((src, i) => (
                        <div className="relative aspect-[4/3] flex-[0_0_100%]" key={i}>
                            <Image
                                src={src}
                                alt={`banner-${i}`}
                                fill
                                unoptimized
                                priority={i === 0}
                                className="object-contain bg-neutral-900"
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
        <div className="flex gap-1 justify-center -translate-y-6">
            {arr.map((_, index) => {
                const selected = index === selectedIndex
                return (
                    <div
                        className={cn({
                            'h-2 w-2 rounded-full transition-all duration-300 bg-primary-foreground':
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
