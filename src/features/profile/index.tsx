import { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Page from '@/components/ui/Page'
import Heading from '@/components/ui/Typography'
import OwnedUsernamesTable from './components/OwnedUsernamesTable'
import { useProfileItems } from './hooks/useProfileItems'
import { shorten } from '@/utils/username'

const Profile = () => {
  const { walletAddress: walletAddressParam } = useParams()

  const normalizedAddress = useMemo(
    () => walletAddressParam?.trim() ?? null,
    [walletAddressParam]
  )

  const {
    rows,
    isLoading,
    isRefetching,
    error,
    refetch,
    hasMore,
    fetchNextPage,
    isFetchingNextPage,
  } = useProfileItems({
    address: normalizedAddress,
    limit: 50,
    sortBy: 'RECEIVED_DATE',
    sortDirection: 'DESC',
  })

  const errorMessage = error instanceof Error ? error.message : error ? 'Unknown error' : null

  const handleLoadMore = useCallback(() => {
    if (hasMore) {
      void fetchNextPage()
    }
  }, [hasMore, fetchNextPage])

  const displayAddress = normalizedAddress ? shorten(normalizedAddress) : null
  const headingTitle = normalizedAddress ? `Profile of ${displayAddress}` : 'Profile'

  return (
    <Page>
      <div className="flex flex-col gap-6 mt-5">
        <div className="flex flex-col gap-1">
          <Heading variant="h2" title={headingTitle} color="white" fontWeight={700} />
          {normalizedAddress ? (
            <span className="text-sm text-gray-300 break-all uppercase tracking-wide">{normalizedAddress}</span>
          ) : null}
        </div>

        {!normalizedAddress ? (
          <div className="rounded-md border border-header bg-header/40 p-4 text-sm text-gray-300">
            No wallet address provided.
          </div>
        ) : (
          <OwnedUsernamesTable
            data={rows}
            isLoading={isLoading}
            isRefetching={isRefetching}
            error={errorMessage}
            onRetry={refetch}
            onLoadMore={hasMore ? handleLoadMore : undefined}
            canLoadMore={hasMore}
            isFetchingNextPage={isFetchingNextPage}
          />
        )}
      </div>
    </Page>
  )
}

export default Profile
