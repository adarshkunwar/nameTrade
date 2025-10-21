import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowDown, FiArrowUp } from 'react-icons/fi'
import Table from '@/components/ui/Table'
import { Spinner } from '@/components/ui/Spinner'
import Shimmer from '@/components/ui/Shimmer'
import { CONSTANTS } from '../constant/data.const'
import Heading from '@/components/ui/Typography'
import { walletAddress, ellipsiAtEnd } from '@/utils/username'
import { formatRelativeTime } from '@/utils/date'
import { cryptic } from '@/lib/utils'
import { useCollectionItems } from '../hooks/useCollection'

const AllUsernamesTable = () => {
  const [mintSortDirection, setMintSortDirection] = useState<'ASC' | 'DESC'>('DESC')

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

  const showSkeleton = isLoading && data.length === 0
  const showEmpty = !isLoading && !error && data.length === 0
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const columns = useMemo(
    () => [
      {
        accessorKey: 'username',
        header: 'Username',
        cell: ({ row }: any) => {
          const usernameValue = row.original.username
          const display = `@${usernameValue.split('.base')[0]}`
          return (
            <div className="flex flex-col gap-1">
              <Link
                to={`/username/${cryptic().urlSafeEncrypt(row.original.tokenId)}`}
                state={{ username: row.original.username }}
                className="font-semibold text-white transition "
              >
                {ellipsiAtEnd(display, 15)}
              </Link>
            </div>
          )
        },
      },
      {
        accessorKey: 'ownerAddress',
        header: 'Owner',
        cell: ({ row }: any) =>
          row.original.ownerAddress && row.original.ownerAddress !== '—' ? (
            <Link
              to={`/profile/${cryptic().urlSafeEncrypt(row.original.ownerAddress)}`}
              className="font-semibold text-white transition-colors "
              title={row.original.ownerAddress}
            >
              {walletAddress(row.original.ownerAddress)}
            </Link>
          ) : (
            <div className="font-semibold text-white">{walletAddress(row.original.ownerAddress)}</div>
          ),
      },
      {
        accessorKey: 'createdAt',
        header: () => (
          <button
            type="button"
            onClick={handleToggleMintSort}
            className="flex items-center gap-2 text-sm font-semibold text-white transition hover:text-primary"
          >
            Minted At
            {mintSortDirection === 'DESC' ? <FiArrowDown /> : <FiArrowUp />}
          </button>
        ),
        cell: ({ row }: any) => (
          <span className="text-sm text-white">{formatRelativeTime(row.original.createdAt)}</span>
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

      {showSkeleton && !error && <SkeletonTable columns={columns} />}

      {!showSkeleton && !error && data.length > 0 && (
        <div className="flex flex-col gap-3">
          <Table data={data} columns={columns} />
        </div>
      )}

      {!showSkeleton && showEmpty && !isLoading && !error && data.length === 0 && (
        <p>No usernames available right now.</p>
      )}

      {!showSkeleton && hasMoreAllUsernames && <div ref={loadMoreRef} className="h-1" />}

      {!showSkeleton && isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      )}
    </div>
  )
}

const SkeletonTable = ({ columns, rowCount = 5 }: { columns: any[]; rowCount?: number }) => {
  const skeletonWidths: Record<string, string> = {
    username: '50%',
    ownerAddress: '40%',
    createdAt: '35%',
  }

  return (
    <table className="w-full border-collapse border border-header rounded-md">
      <thead className="bg-primary text-white">
        <tr className="text-left border-b border-header rounded-t-md">
          {columns.map((column, index) => (
            <th key={index} className="py-2 px-4">
              {typeof column.header === 'function' ? column.header() : column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <tr key={rowIndex} className="border-b border-header hover:bg-header rounded-b-md">
            {columns.map((column, columnIndex) => (
              <td key={columnIndex} className="py-3 px-4">
                <Shimmer height={14} width={skeletonWidths[column.accessorKey] ?? '60%'} rounded />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default AllUsernamesTable
