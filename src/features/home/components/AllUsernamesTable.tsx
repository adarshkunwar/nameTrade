import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Table from '@/components/ui/Table'
import { Spinner } from '@/components/ui/Spinner'
import Shimmer from '@/components/ui/Shimmer'
import type { TUsername } from '../types/username'
import { CONSTANTS } from '../constant/data.const'
import Heading from '@/components/ui/Typography'
import { shorten } from '@/utils/username'

interface AllUsernamesTableProps {
  data: TUsername[]
  isLoading: boolean
  isRefetching: boolean
  error: string | null
  onRetry: () => void | Promise<unknown>
  onLoadMore?: () => void
  canLoadMore?: boolean
  isFetchingNextPage?: boolean
}

const COLUMNS = [
  {
    accessorKey: 'username',
    header: 'Username',
    cell: ({ row }: any) => (
      <div className="flex flex-col gap-1">
        <div className="font-semibold text-white">@{row.original.username.split('.base')[0]}</div>
      </div>
    ),
  },
  {
    accessorKey: 'ownerAddress',
    header: 'Owner',
    cell: ({ row }: any) => (
      <div className="flex flex-col gap-0.5">
        {row.original.ownerAddress && row.original.ownerAddress !== '—' ? (
          <>
            <Link
              to={`/profile/${row.original.ownerAddress}`}
              className="font-semibold text-white transition-colors hover:text-primary"
            >
              {shorten(row.original.ownerAddress)}
            </Link>
            <span className="text-xs text-gray-400">{row.original.ownerAddress}</span>
          </>
        ) : (
          <div className="font-semibold text-white">{shorten(row.original.ownerAddress)}</div>
        )}
      </div>
    ),
  },
]

const AllUsernamesTable = ({
  data,
  isLoading,
  isRefetching,
  error,
  onRetry,
  onLoadMore,
  canLoadMore = false,
  isFetchingNextPage = false,
}: AllUsernamesTableProps) => {
  const showSkeleton = isLoading && data.length === 0
  const showEmpty = !isLoading && !error && data.length === 0
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

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
    <div className="rounded-md border border-header ">
      {showSkeleton && <SkeletonRows />}

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

      {!showSkeleton && !error && data.length > 0 && (
        <div className="flex flex-col gap-3">
          {isRefetching && (
            <div className="flex items-center gap-2 rounded border border-header/50 bg-header/30 p-2 text-sm text-gray">
              <Spinner size="sm" />
            </div>
          )}
          <Table data={data} columns={COLUMNS} />
        </div>
      )}

      {showEmpty && !isLoading && !error && data.length === 0 && <p>No usernames available right now.</p>}

      {onLoadMore && canLoadMore && <div ref={loadMoreRef} className="h-1" />}

      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      )}
    </div>
  )
}

const SkeletonRows = () => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 rounded border border-header/60 bg-header/60 p-3"
      >
        <div className="flex flex-col gap-2">
          <Shimmer height={14} rounded />
          <Shimmer width="60%" height={10} rounded />
        </div>
        <div className="flex flex-col gap-2">
          <Shimmer width="70%" height={14} rounded />
          <Shimmer width="50%" height={10} rounded />
        </div>
        <div className="flex flex-col gap-2">
          <Shimmer width="60%" height={14} rounded />
          <Shimmer width="40%" height={10} rounded />
        </div>
        <div className="flex flex-col gap-2">
          <Shimmer width="80%" height={14} rounded />
          <Shimmer width="50%" height={10} rounded />
        </div>
      </div>
    ))}
  </div>
)

export default AllUsernamesTable
