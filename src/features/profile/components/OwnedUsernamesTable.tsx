import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import Table from '@/components/ui/Table'
import Heading from '@/components/ui/Typography'
import Shimmer from '@/components/ui/Shimmer'
import { Spinner } from '@/components/ui/Spinner'
import type { TProfileUsername } from '../types/profile'
import { PROFILE_CONSTANTS } from '../constant/data.const'
import { walletAddress } from '@/utils/username'
import { formatDateTime } from '@/utils/date'

interface OwnedUsernamesTableProps {
  data: TProfileUsername[]
  isLoading: boolean
  isRefetching: boolean
  error: string | null
  onRetry: () => void | Promise<unknown>
  onLoadMore?: () => void
  canLoadMore?: boolean
  isFetchingNextPage?: boolean
}

const OwnedUsernamesTable = ({
  data,
  isLoading,
  isRefetching,
  error,
  onRetry,
  onLoadMore,
  canLoadMore = false,
  isFetchingNextPage = false,
}: OwnedUsernamesTableProps) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const columns = useMemo(
    () => [
      {
        accessorKey: 'username',
        header: 'Username',
        cell: ({ row }: any) => (
          <div className="flex flex-col gap-1">
            <Link
              to={`/username/${row.original.tokenId}`}
              state={{ username: row.original.username }}
              className="font-semibold text-white transition hover:text-primary"
            >
              @{row.original.username.split('.base')[0]}
            </Link>
            <span className="text-xs text-gray-400">{row.original.username}</span>
          </div>
        ),
      },
      {
        accessorKey: 'collectionName',
        header: 'Collection',
        cell: ({ row }: any) => <span className="text-sm text-white capitalize">{row.original.collectionName}</span>,
      },
      // {
      //   accessorKey: 'tokenId',
      //   header: 'Token ID',
      //   cell: ({ row }: any) => <span className="text-sm text-white">{row.original.tokenId}</span>,
      // },
      {
        accessorKey: 'contractAddress',
        header: 'Contract',
        cell: ({ row }: any) => (
          <span className="text-sm text-white" title={row.original.contractAddress}>
            {walletAddress(row.original.contractAddress)}
          </span>
        ),
      },
      {
        accessorKey: 'quantity',
        header: 'Quantity',
        cell: ({ row }: any) => <span className="text-sm text-white">{row.original.quantity}</span>,
      },
      {
        accessorKey: 'lastTransferAt',
        header: 'Last Transfer',
        cell: ({ row }: any) => (
          <span className="text-sm text-white">{formatDateTime(row.original.lastTransferAt)}</span>
        ),
      },
    ],
    []
  )

  const showSkeleton = isLoading && data.length === 0
  const showEmpty = !isLoading && !error && data.length === 0

  useEffect(() => {
    if (!onLoadMore || !canLoadMore || isFetchingNextPage) return

    const target = loadMoreRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
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
    <div className="rounded-md border border-header">
      {showSkeleton && <OwnedUsernamesSkeleton />}

      {error && (
        <div className="flex flex-col gap-2 p-4">
          <Heading variant="body" title={PROFILE_CONSTANTS.TABLE.ERROR} color="white" />
          <p className="text-sm text-gray-300">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="self-start rounded border border-primary px-3 py-1 text-sm text-white transition hover:bg-primary/20"
          >
            Retry
          </button>
        </div>
      )}

      {!showSkeleton && !error && data.length > 0 && (
        <div className="flex flex-col gap-3 p-4">
          <Heading variant="h3" title={PROFILE_CONSTANTS.TABLE.HEADING} color="white" fontWeight={600} />

          {isRefetching && (
            <div className="flex items-center gap-2 rounded border border-header/50 bg-header/30 p-2 text-sm text-gray-300">
              <Spinner size="sm" />
              <span>Refreshing...</span>
            </div>
          )}

          <Table data={data} columns={columns} />
        </div>
      )}

      {showEmpty && !error && <div className="p-4 text-sm text-gray-300">{PROFILE_CONSTANTS.TABLE.EMPTY}</div>}

      {onLoadMore && canLoadMore && <div ref={loadMoreRef} className="h-1" />}

      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      )}
    </div>
  )
}

const OwnedUsernamesSkeleton = () => (
  <div className="flex flex-col gap-3 p-4">
    <Shimmer width="40%" height={24} rounded />
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="grid grid-cols-[2fr,1.2fr,1fr,1.6fr,0.8fr,1.4fr] gap-4 rounded border border-header/60 bg-header/60 p-3"
      >
        <div className="flex flex-col gap-2">
          <Shimmer height={14} rounded />
          <Shimmer width="60%" height={10} rounded />
        </div>
        <Shimmer width="80%" height={14} rounded />
        <Shimmer width="60%" height={14} rounded />
        <Shimmer width="70%" height={14} rounded />
        <Shimmer width="50%" height={14} rounded />
        <Shimmer width="65%" height={14} rounded />
      </div>
    ))}
  </div>
)

export default OwnedUsernamesTable
