import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowDown, FiArrowUp } from 'react-icons/fi'
import Table from '@/components/ui/Table'
import { Spinner } from '@/components/ui/Spinner'
import Shimmer from '@/components/ui/Shimmer'
import type { TUsername } from '../types/username'
import { CONSTANTS } from '../constant/data.const'
import Heading from '@/components/ui/Typography'
import { shorten } from '@/utils/username'
import { formatRelativeTime } from '@/utils/date'

interface AllUsernamesTableProps {
  data: TUsername[]
  isLoading: boolean
  error: string | null
  onRetry: () => void | Promise<unknown>
  onLoadMore?: () => void
  canLoadMore?: boolean
  isFetchingNextPage?: boolean
  sortDirection: 'ASC' | 'DESC'
  onToggleSort: () => void
}

const AllUsernamesTable = ({
  data,
  isLoading,
  error,
  onRetry,
  onLoadMore,
  canLoadMore = false,
  isFetchingNextPage = false,
  sortDirection,
  onToggleSort,
}: AllUsernamesTableProps) => {
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
                to={`/username/${row.original.tokenId}`}
                state={{ username: usernameValue }}
                className="font-semibold text-white transition hover:text-primary"
              >
                {display}
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
              to={`/profile/${row.original.ownerAddress}`}
              className="font-semibold text-white transition-colors hover:text-primary"
              title={row.original.ownerAddress}
            >
              {shorten(row.original.ownerAddress)}
            </Link>
          ) : (
            <div className="font-semibold text-white">{shorten(row.original.ownerAddress)}</div>
          ),
      },
      {
        accessorKey: 'createdAt',
        header: () => (
          <button
            type="button"
            onClick={onToggleSort}
            className="flex items-center gap-2 text-sm font-semibold text-white transition hover:text-primary"
          >
            Minted At
            {sortDirection === 'DESC' ? <FiArrowDown /> : <FiArrowUp />}
          </button>
        ),
        cell: ({ row }: any) => (
          <span className="text-sm text-white">{formatRelativeTime(row.original.createdAt)}</span>
        ),
      },
    ],
    [onToggleSort, sortDirection]
  )

  useEffect(() => {
    if (!onLoadMore || !canLoadMore || isFetchingNextPage) return

    const target = loadMoreRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting)
        if (isIntersecting) {
          observer.disconnect()
          void onLoadMore()
        }
      },
      { root: null, rootMargin: '0px', threshold: 0.1 }
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [onLoadMore, canLoadMore, isFetchingNextPage])

  return (
    <div className="mx-auto w-full max-w-3xl">
      {error && (
        <div className="flex flex-col gap-2">
          <Heading variant="body" title={CONSTANTS.SEARCH.FETCHING_USERNAMES_ERROR} color="white" />
          <p className="text-sm text-gray">{error}</p>
          <button
            onClick={onRetry}
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

      {!showSkeleton && onLoadMore && canLoadMore && <div ref={loadMoreRef} className="h-1" />}

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
