import Page from '@/components/ui/Page'
import Heading from '@/components/ui/Typography'
import { ENV } from '@/config/env'
import { useParams } from 'react-router-dom'
import HighestBidTable from './components/highestBidTable'
import { BID_HISTORY_DATA } from './constant/table.const'
import BidHistory from './components/BidHistory'
import { copyToClipboard, cryptic } from '@/lib/utils'
import { useUsername } from './hooks/useUsername'
import PlaceABidModal from './components/PlaceABidModal'
import HighestOfferTable from './components/highestOfferTable'
import Timer from '@/components/ui/Timer'
import PlaceAnOfferModal from './components/placeAnOfferModal'

const Profile = () => {
  const { VITE_SUFFIX } = ENV

  const { tokenId: tokenIdParam } = useParams()
  const decryptedTokenId = cryptic().urlSafeDecrypt(tokenIdParam ?? '')
  const tokenId = decryptedTokenId || null

  const {
    username: fetchedUsername,
    isLoading: isUsernameFetching,
    isError: isUsernameError,
  } = useUsername({
    tokenId,
    enabled: Boolean(tokenId),
  })

  const resolvedUsername = fetchedUsername ?? ''
  const hasResolvedUsername = resolvedUsername.length > 0
  const hasSuffix = hasResolvedUsername && Boolean(VITE_SUFFIX) && resolvedUsername.endsWith(VITE_SUFFIX)
  const baseUsername = hasResolvedUsername
    ? hasSuffix
      ? resolvedUsername.slice(0, resolvedUsername.length - VITE_SUFFIX.length)
      : resolvedUsername
    : ''
  const displayUsername =
    baseUsername.length > 0
      ? baseUsername
      : isUsernameFetching && !isUsernameError
      ? ''
      : decryptedTokenId ?? 'Username'

  return (
    <Page>
      <div className="flex flex-col gap-5 mt-5">
        <div className="flex justify-between w-full">
          <Heading variant="h2" title={displayUsername} color="white" fontWeight={700} />
          <Timer targetDate={new Date(Date.now() + 1000 * 60 * 60 * 24)} />
        </div>

        <div className="rounded-lg border border-header bg-header/30 p-4 text-sm text-white">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1 cursor-pointer" onClick={() => copyToClipboard(tokenId ?? '')}>
              <span className="text-xs uppercase tracking-wide text-gray">Token ID</span>
              <span className="font-mono break-all text-white">{tokenId ?? 'Unavailable'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex flex-col gap-2">
            <HighestBidTable />
            <PlaceABidModal username={displayUsername} />
          </div>
          <div className="flex flex-col gap-2">
            <HighestOfferTable />
            <PlaceAnOfferModal username={displayUsername} />
          </div>
        </div>

        <div>
          <BidHistory data={BID_HISTORY_DATA} />
        </div>
      </div>
    </Page>
  )
}

export default Profile
