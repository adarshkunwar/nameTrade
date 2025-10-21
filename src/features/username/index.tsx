import Page from '@/components/ui/Page'
import Heading from '@/components/ui/Typography'
import { ENV } from '@/config/env'
import { useLocation, useParams } from 'react-router-dom'
import HighestBid from './components/HighestBid'
import { BID_HISTORY_DATA, HIGHEST_BID_DATA } from './constant/table.const'
import BidHistory from './components/BidHistory'
import { copyToClipboard, cryptic } from '@/lib/utils'

type UsernameLocationState = {
  username?: string
}

const Profile = () => {
  const { tokenId: tokenIdParam } = useParams()
  const decryptedTokenId = cryptic().urlSafeDecrypt(tokenIdParam ?? '')

  const location = useLocation()
  const state = (location.state ?? {}) as UsernameLocationState
  const suffix = ENV.VITE_SUFFIX ?? ''

  const usernameFromState = typeof state.username === 'string' ? state.username : ''
  const hasUsername = usernameFromState.length > 0
  const hasSuffix = hasUsername && Boolean(suffix) && usernameFromState.endsWith(suffix)
  const baseUsername = hasUsername
    ? hasSuffix
      ? usernameFromState.slice(0, usernameFromState.length - suffix.length)
      : usernameFromState
    : ''
  const displayUsername = hasUsername ? baseUsername : decryptedTokenId ?? 'Username'
  const tokenId = decryptedTokenId ?? null

  return (
    <Page>
      <div className="flex flex-col gap-5 mt-5">
        <div className="flex flex-col gap-1">
          <Heading
            variant="h2"
            title={displayUsername}
            color="white"
            fontWeight={700}
            onClick={() => copyToClipboard(displayUsername ?? '')}
          />
        </div>

        <div className="rounded-lg border border-header bg-header/30 p-4 text-sm text-white">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-gray">Token ID</span>
              <span className="font-mono break-all text-white">{tokenId ?? 'Unavailable'}</span>
            </div>
          </div>
        </div>

        <div>
          <HighestBid data={HIGHEST_BID_DATA} />
        </div>

        <div>
          <BidHistory data={BID_HISTORY_DATA} />
        </div>
      </div>
    </Page>
  )
}

export default Profile
