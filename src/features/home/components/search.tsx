import { useEffect, useMemo, useState } from 'react'
import { CiSearch } from 'react-icons/ci'
import { IoClose } from 'react-icons/io5'
import Shimmer from '@/components/ui/Shimmer'
import { Spinner } from '@/components/ui/Spinner'
import type { UsernameRow } from '../hooks/useCollectionItems'

interface SearchProps {
  searchTerm: string
  onSearchTermChange: (value: string) => void
  results: UsernameRow[]
  isLoading: boolean
  error: string | null
  onResultSelect?: (value: UsernameRow) => void
}

const Search = ({
  searchTerm,
  onSearchTermChange,
  results,
  isLoading,
  error,
  onResultSelect,
}: SearchProps) => {
  const [value, setValue] = useState(searchTerm)

  useEffect(() => {
    setValue(searchTerm)
  }, [searchTerm])

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchTermChange(value)
    }, 250)

    return () => clearTimeout(handler)
  }, [value, onSearchTermChange])

  const trimmedValue = value.trim()
  const shouldShowPanel = trimmedValue.length > 0 || isLoading || Boolean(error)
  const showResults = trimmedValue.length > 0 && results.length > 0 && !isLoading && !error
  const showEmpty = trimmedValue.length > 0 && results.length === 0 && !isLoading && !error

  const panelContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-2 p-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center rounded bg-header/80 px-3 py-2">
              <div className="flex flex-1">
                <Shimmer width="50%" height={14} rounded />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )
    }

    if (showResults) {
      return (
        <div className="flex flex-col gap-1 p-2">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onResultSelect?.(item)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-white hover:bg-primary/40"
            >
              
              <div className="flex flex-1 flex-col">
                <span className="font-semibold">@{item.username.split('.base')[0]}</span>
               
              </div>
            
            </button>
          ))}
        </div>
      )
    }

    if (showEmpty) {
      return (
        <div className="px-4 py-3 text-sm text-gray">
          No usernames found for <span className="font-semibold text-white">“{trimmedValue}”</span>.
        </div>
      )
    }

    return null
  }, [isLoading, error, results, showResults, showEmpty, onResultSelect, trimmedValue])

  return (
    <div className="relative w-full max-w-2xl">
      <div className="flex items-center gap-3 rounded-md border border-header bg-primary/80 p-4">
        <CiSearch className="text-lg text-white" />
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search usernames"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray"
        />
        {isLoading && (
          <div className="text-secondary">
            <Spinner size="sm" />
          </div>
        )}
        {value && (
          <button
            type="button"
            onClick={() => setValue('')}
            className="rounded-full p-1 text-gray transition hover:bg-header hover:text-white"
            aria-label="Clear search"
          >
            <IoClose className="text-lg" />
          </button>
        )}
      </div>

      {shouldShowPanel && panelContent && (
        <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-md border border-header bg-header/95 shadow-lg backdrop-blur">
         
          {panelContent}
        </div>
      )}
    </div>
  )
}


export default Search
