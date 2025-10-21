    'use client'

    import * as React from 'react'
    import { useRouter } from 'next/navigation'
    import { CommandGroup, CommandItem } from '@/components/ui/command'

    interface SearchResult {
    name: string
    type: 'product' | 'brand' | 'category' | 'banner' | 'offer'
    slug: string
    }

    interface SearchResultsBlockProps {
    results: SearchResult[]
    query: string
    }

    export function SearchResultsBlock({ results, query }: SearchResultsBlockProps) {
    const router = useRouter()

    const handleSelect = (item: SearchResult) => {
        switch (item.type) {
        case 'product':
            router.push(`/products/${item.slug}`)
            break
        case 'brand':
            router.push(`/products?brand=${item.slug}`)
            break
        case 'category':
            router.push(`/products?category=${item.slug}`)
            break
        case 'banner':
            router.push(`/banner/${item.slug}`)
            break
        case 'offer':
            router.push(`/offers/${item.slug}`)
            break
        }
    }

    const highlightMatch = (text: string) => {
        if (!query) return text
        const regex = new RegExp(`(${query})`, 'ig')
        const parts = text.split(regex)
        return (
        <>
            {parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <span key={i} className="bg-yellow-200 dark:bg-yellow-700">
                {part}
                </span>
            ) : (
                <span key={i}>{part}</span>
            )
            )}
        </>
        )
    }

    if (!results || results.length === 0) return null

    return (
        <CommandGroup heading="Results">
        {results.map((item, index) => (
            <CommandItem
            key={item.slug + index}
            onSelect={() => handleSelect(item)}
            className="flex items-center justify-start space-x-2"
            >
            <span className="px-1 py-0.5 text-xs rounded bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                {item.type}
            </span>
            <span>{highlightMatch(item.name)}</span>
            </CommandItem>
        ))}
        </CommandGroup>
    )
    }
