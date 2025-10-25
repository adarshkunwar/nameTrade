import { useMemo } from 'react';
import { Link } from 'react-router-dom'
import Table from '@/components/ui/Table'
import Heading from '@/components/ui/Typography'
import Shimmer from '@/components/ui/Shimmer'
import { Spinner } from '@/components/ui/Spinner'
import type { TBaseUsername } from '../types/basenames'
import { PROFILE_CONSTANTS } from '../constant/data.const'
import { formatDateTime } from '@/utils/date'
import OwnedUsernameActions from './OwnedUsernameActionButton'

interface OwnedUsernamesTableProps {
  data: TBaseUsername[];
  isLoading: boolean;
  isRefetching: boolean;
  error: string | null;
  onRetry: () => void | Promise<unknown>;
  listedTokenIds: Set<string>;
  auctionedTokenIds: Set<string>;
}

const OwnedUsernamesTable = ({
  data,
  isLoading,
  isRefetching,
  error,
  onRetry,
  listedTokenIds,
  auctionedTokenIds,
}: OwnedUsernamesTableProps) => {
  const columns = useMemo(
    () => [
      {
        accessorKey: 'domain',
        header: 'Username',
        cell: ({ row }: any) => (
          <div className="flex flex-col gap-1">
            <Link
              to={`/username/${row.original.token_id}`}
              state={{ username: row.original.domain }}
              className="font-semibold text-white transition hover:text-primary"
            >
              @{row.original.domain.split('.base')[0]}
            </Link>
            <span className="text-xs text-gray-400">{row.original.domain}</span>
          </div>
        ),
      },
      {
        accessorKey: 'expires_at',
        header: 'Expires At',
        cell: ({ row }: any) => (
          <span className="text-sm text-white">{formatDateTime(row.original.expires_at)}</span>
        ),
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        cell: ({ row }: any) => {
          const ownedTokenId = row.original.token_id.toString();
          const isListed = listedTokenIds.has(ownedTokenId);
          const isAuctioned = auctionedTokenIds.has(ownedTokenId);
          return (
            <OwnedUsernameActions
              contractAddress={PROFILE_CONSTANTS.BASENAMES_CONTRACT_ADDRESS}
              tokenId={row.original.token_id}
              isListed={isListed}
              isAuctioned={isAuctioned}
            />
          );
        },
      },
    ],
    [listedTokenIds, auctionedTokenIds] // Re-create columns when listedTokenIds or auctionedTokenIds changes
  )

  const showSkeleton = isLoading && data.length === 0
  const showEmpty = !isLoading && !error && data.length === 0

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
