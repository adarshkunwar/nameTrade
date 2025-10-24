import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowDown, FiArrowUp } from 'react-icons/fi'
import Table from '@/components/ui/Table'
import { CONSTANTS } from '../constant/data.const'
import Heading from '@/components/ui/Typography'
import {  ellipsiAtEnd } from '@/utils/username'
import { formatRelativeTime } from '@/utils/date'
import { cryptic } from '@/lib/utils'
import { useCollectionItems } from '../hooks/useCollection'
import Button from '@/components/ui/Button'

const AllUsernamesTable = () => {
  const [mintSortDirection, setMintSortDirection] = useState<'ASC' | 'DESC'>('DESC')

  const { urlSafeEncrypt } = cryptic()

  const handleToggleMintSort = useCallback(() => {
    setMintSortDirection((prev) => (prev === 'DESC' ? 'ASC' : 'DESC'))
  }, [])

  const {
    rows: data,
    isLoading,
    error,
    refetch: onRetry,
    fetchNextPage: fetchMoreAllUsernames,
    isFetchingNextPage,
    hasMore: hasMoreAllUsernames,
  } = useCollectionItems({
    sortBy: 'CREATED_DATE',
    sortDirection: mintSortDirection,
    limit: 25,
  })

  const handleLoadMoreUsernames = useCallback(() => {
    if (hasMoreAllUsernames) {
      void fetchMoreAllUsernames()
    }
  }, [hasMoreAllUsernames, fetchMoreAllUsernames])

  // const showSkeleton = isLoading && data.length === 0
  // const showEmpty = !isLoading && !error && data.length === 0
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const columns = useMemo(
    () => [
      {
        accessorKey: 'username',
        header: 'Username',
        size: 500,
        cell: ({ row }: any) => {
          const usernameValue = row.original?.username
          const display = `@${usernameValue?.split('.base')?.[0]}`
          return (
            <div className="flex flex-col gap-1">
              <Link
                to={`/username/${urlSafeEncrypt(row?.original?.tokenId ?? '')}`}
                state={{ username: row.original?.username }}
                className="font-semibold text-white transition "
              >
                {ellipsiAtEnd(display, 15)}
              </Link>
            </div>
          )
        },
      },
      {
        accessorKey: 'createdAt',
        size: 100,
        header: () => (
          <button
            type="button"
            onClick={handleToggleMintSort}
            className="flex text-nowrap items-center gap-2 text-sm font-semibold text-white transition"
          >
            Minted At
            {mintSortDirection === 'DESC' ? <FiArrowDown /> : <FiArrowUp />}
          </button>
        ),
        cell: ({ row }: any) => (
          <span className="text-sm text-white">{formatRelativeTime(row.original?.createdAt ?? '')}</span>
        ),
      },
      {
        accessorKey: 'action',
        size: 100,
        header: "",
        cell: ({ row }: any) => (
          <span className="text-sm text-white">
            <Button variant="secondary" size="sm">Buy</Button>
          </span>
        ),
      },
    ],
    [handleToggleMintSort, mintSortDirection]
  )

  useEffect(() => {
    if (!handleLoadMoreUsernames || !hasMoreAllUsernames || isFetchingNextPage) return

    const target = loadMoreRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting)
        if (isIntersecting) {
          observer.disconnect()
          void handleLoadMoreUsernames()
        }
      },
      { root: null, rootMargin: '0px', threshold: 0.1 }
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [handleLoadMoreUsernames, hasMoreAllUsernames, isFetchingNextPage])

  return (
    <div className="mx-auto w-full max-w-3xl">
      {error && (
        <div className="flex flex-col gap-2">
          <Heading variant="body" title={CONSTANTS.SEARCH.FETCHING_USERNAMES_ERROR} color="white" />
          <p className="text-sm text-gray">{error instanceof Error ? error.message : error ? 'Unknown error' : null}</p>
          <button
            onClick={() => void onRetry()}
            className="self-start rounded border border-primary px-3 py-1 text-sm text-white hover:bg-primary/20"
          >
            Retry
          </button>
        </div>
      )}

      <Table data={data} columns={columns} isLoading={isLoading} ref={loadMoreRef as any} />
    </div>
  )
}

export default AllUsernamesTable
