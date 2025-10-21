'use client'

import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { docsConfig } from '@/config/docs'
import { cn } from '@/lib/utils'
import { CircleIcon, LaptopIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import * as React from 'react'

type SearchResult = {
  name: string
  type: 'product' | 'brand' | 'category' | 'banner' | 'offer'
  slug: string
}

export function CommandMenu({ ...props }: any) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const { setTheme } = useTheme()
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)

  // Toggle CMD+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  // Fetch search results (debounced)
  React.useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.length >= 3) {
        setLoading(true)
        try {
          const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`)
          if (res.ok) {
            const data = await res.json()
            setResults(data)
          } else {
            setResults([])
          }
        } catch (err) {
          console.error('Search error:', err)
          setResults([])
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
      }
    }, 400)

    return () => clearTimeout(delayDebounce)
  }, [query])

  // Navigate to a search item
  const handleSelect = (item: SearchResult) => {
    setOpen(false)
    switch (item.type) {
      case 'product':
        router.push(`/products/${item.slug}`)          // product link
        break
      case 'category':
        router.push(`/products?category=${item.slug}`) // category link
        break
      case 'brand':
        router.push(`/products?brand=${item.slug}`)    // brand link
        break
      // Keep banner/offer if needed
      case 'banner':
        router.push(`/banner/${item.slug}`)
        break
      case 'offer':
        router.push(`/offers/${item.slug}`)
        break
      default:
        break
    }
  }




  // Highlight query match
  const highlightMatch = (text: string) => {
    if (!query) return text
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${safe})`, 'ig')
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 dark:bg-yellow-700">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          'relative w-full justify-start text-sm font-light text-muted-foreground sm:pr-12 md:w-40 lg:w-64'
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="inline-flex">Search...</span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type a command or search..."
          value={query}
          onValueChange={setQuery}
        />

        {/* Force re-render on query or results */}
        <CommandList key={query + results.length}>
          {/* Search results */}
          {loading && <CommandEmpty>Searching...</CommandEmpty>}
          {!loading && results.length === 0 && query.length >= 3 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {!loading && results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((item, index) => (
                <CommandItem
                  key={`${item.type}-${item.slug}-${index}`}
                  value={item.name}
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
          )}

          {/* Static Links */}
          <CommandGroup heading="Links">
            {docsConfig.sidebarNav.map((navItem) => (
              <CommandItem
                key={navItem.href}
                value={navItem.title}
                onSelect={() => runCommand(() => router.push(navItem.href as string))}
              >
                <div className="mr-2 flex h-4 items-center justify-center">
                  <CircleIcon className="h-3" />
                </div>
                {navItem.title}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Theme Section */}
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <SunIcon className="mr-2 h-4" />
              Light
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <MoonIcon className="mr-2 h-4" />
              Dark
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
              <LaptopIcon className="mr-2 h-4" />
              System
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
