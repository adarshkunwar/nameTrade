import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Page from '@/components/ui/Page'
import Heading from '@/components/ui/Typography'
import { cryptic } from '@/lib/utils'
import OwnedUsernamesTable from './components/OwnedUsernamesTable'
import { useGetListedNfts } from '@/hooks/contract/useGetListedNfts';
import { useGetActiveAuctions } from '@/hooks/contract/useGetActiveAuctions';
import { useProfileItems } from './hooks/useProfileItems'
import { walletAddress } from '@/utils/username'

const Profile = () => {
  const { walletAddress: walletAddressParam } = useParams()
  const { listings: listedNfts } = useGetListedNfts();
  const { auctions: activeAuctions } = useGetActiveAuctions();

  const listedTokenIds = useMemo(() => {
    return new Set(listedNfts.map((item) => item.tokenId.toString()));
  }, [listedNfts]);

  const auctionedTokenIds = useMemo(() => {
    return new Set(activeAuctions.map((item) => item.tokenId.toString()));
  }, [activeAuctions]);

  const normalizedAddress = useMemo(() => {
    const raw = walletAddressParam ?? null
    if (!raw) return null
    try {
      return cryptic().urlSafeDecrypt(raw).trim()
    } catch (_e) {
      return raw.trim()
    }
  }, [walletAddressParam])

  const { rows, isLoading, isRefetching, error, refetch } = useProfileItems(
    {
      address: normalizedAddress,
    }
  )

  const errorMessage = error instanceof Error ? error.message : error ? 'Unknown error' : null

  const displayAddress = normalizedAddress ? walletAddress(normalizedAddress) : null
  const headingTitle = normalizedAddress ? `Profile of ${displayAddress}` : 'Profile'

  return (
    <Page>
      <div className="flex flex-col gap-6 mt-5">
        <div className="flex flex-col gap-1">
          <Heading variant="h2" title={headingTitle} color="white" fontWeight={700} />
          
        </div>

        {!normalizedAddress ? (
          <div className="rounded-md border border-header bg-header/40 p-4 text-sm text-gray-300">
            No wallet address provided.
          </div>
        ) : (
          <OwnedUsernamesTable
            data={rows || []}
            isLoading={isLoading}
            isRefetching={isRefetching}
            error={errorMessage}
            onRetry={refetch}
            listedTokenIds={listedTokenIds}
            auctionedTokenIds={auctionedTokenIds}
          />
        )}
      </div>
    </Page>
  )
}

export default Profile
