import Table from '@/components/ui/Table'
import { Spinner } from '@/components/ui/Spinner'
import Shimmer from '@/components/ui/Shimmer'
import type { UsernameRow } from '../hooks/useCollectionItems'
import { cn } from '@/lib/utils'
import { CONSTANTS } from '../constant/data.const'
import Heading from '@/components/ui/Typography'

interface AllUsernamesTableProps {
  data: UsernameRow[]
  isLoading: boolean
  isRefetching: boolean
  error: string | null
  onRetry: () => void | Promise<unknown>
  onLoadMore?: () => void
  canLoadMore?: boolean
  isFetchingNextPage?: boolean
}

const shorten = (value: string) => {
  if (!value || value === '—') return value ?? '—'
  return value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value
}

const COLUMNS = [
  {
    accessorKey: 'username',
    header: 'Username',
    cell: ({ row }: any) => (
      <div className="flex flex-col gap-1">
        <div className="font-semibold text-white">@{row.original.username.split('.base')[0]}</div>
        {/* <div className="text-xs text-secondary">
          Token #{row.original.tokenId} · {shorten(row.original.contractAddress)}
        </div> */}
      </div>
    ),
  },
  // {
  //   accessorKey: 'marketplace',
  //   header: 'Listing',
  //   cell: ({ row }: any) => (
  //     <div className="flex flex-col gap-0.5">
  //       <div className="font-semibold text-white">
  //         {row.original.marketplace !== '—' ? row.original.marketplace : 'Not listed'}
  //       </div>
  //       <div className="text-xs text-gray">
  //         Currency: {row.original.listingCurrency !== '—' ? row.original.listingCurrency : 'N/A'}
  //       </div>
  //     </div>
  //   ),
  // },
  // {
  //   accessorKey: 'bestOfferUsd',
  //   header: 'Best Offer',
  //   cell: ({ row }: any) => (
  //     <div className="flex flex-col gap-0.5">
  //       <div className="font-semibold text-white">{row.original.bestOfferUsd}</div>
  //       <div className="text-xs text-gray">Rarity: {row.original.rarityRank}</div>
  //     </div>
  //   ),
  // },
  {
    accessorKey: 'ownerAddress',
    header: 'Owner',
    cell: ({ row }: any) => (
      <div className="flex flex-col gap-0.5">
        <div className="font-semibold text-white">{shorten(row.original.ownerAddress)}</div>
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

  return (
    <div className="rounded-md border border-header bg-header/40 p-4 text-secondary">
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

      {showEmpty && <p>No usernames available right now.</p>}

      {onLoadMore && (canLoadMore || isFetchingNextPage) && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={!canLoadMore || isFetchingNextPage}
            className={cn(
              'flex items-center gap-2 rounded border border-primary px-4 py-2 text-sm text-white transition-colors',
              canLoadMore && !isFetchingNextPage ? 'hover:bg-primary/20' : 'cursor-not-allowed opacity-70'
            )}
          >
            {isFetchingNextPage && <Spinner size="sm" />}
            <span>{canLoadMore ? 'Load more' : 'No more results'}</span>
          </button>
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
