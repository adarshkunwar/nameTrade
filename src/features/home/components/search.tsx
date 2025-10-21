import { useCallback, useMemo, useState } from 'react'
import Shimmer from '@/components/ui/Shimmer'
import type { TUsername } from '../types/username'
import TextField from '@/components/ui/Text'
import { FormProvider, useForm } from 'react-hook-form'
import { CONSTANTS } from '../constant/data.const'
import { useSearchCollectionItems } from '../hooks/useCollection'
import { cryptic } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

const Search = () => {
  const navigate = useNavigate()

  const [value, setValue] = useState('')

  const {
    rows: results,
    isLoading: isResultsLoading,
    isFetching: isResultsFetching,
    error,
  } = useSearchCollectionItems({
    searchTerm: value,
    limit: 8,
    sortBy: 'CREATED_DATE',
    sortDirection: 'ASC',
  })

  const trimmedValue = value.trim()
  const shouldShowPanel = trimmedValue.length > 0 || isResultsLoading || isResultsFetching || Boolean(error)
  const showResults = trimmedValue.length > 0 && results.length > 0 && !isResultsLoading && !error
  const showEmpty = trimmedValue.length > 0 && results.length === 0 && !isResultsLoading && !error

  const methods = useForm<{ search: string }>({
    defaultValues: {
      search: '',
    },
  })

  const onSubmit = (data: { search: string }) => {
    console.log(data)
  }

  const onResultSelect = useCallback(
    (result: TUsername) => {
      navigate(`/username/${cryptic().urlSafeEncrypt(result.tokenId)}`, {
        state: {
          username: result.username,
        },
      })
    },
    [navigate]
  )

  const panelContent = useMemo(() => {
    if (isResultsLoading) {
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
      return <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-400">{error.message}</div>
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

    if (showEmpty && !isResultsLoading && !isResultsFetching && !error) {
      return (
        <div className="px-4 py-3 text-sm text-gray">
          No usernames found for <span className="font-semibold text-white">“{trimmedValue}”</span>.
        </div>
      )
    }

    return null
  }, [isResultsLoading, isResultsFetching, error, results, showResults, showEmpty, onResultSelect, trimmedValue])

  return (
    <div className="relative w-full ">
      <div className="flex flex-col gap-3 rounded-md border border-header  ">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="w-full">
              <TextField
                name="search"
                placeholder={CONSTANTS.SEARCH.PLACEHOLDER}
                customLabel=""
                value={value}
                type="search"
                onChange={(event) => setValue(event.target.value)}
              />
            </div>
            {/* <button type="submit">Search</button> */}
          </form>
        </FormProvider>
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
