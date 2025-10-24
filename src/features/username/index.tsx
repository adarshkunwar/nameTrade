import Page from '@/components/ui/Page'
import Heading from '@/components/ui/Typography'
import { ENV } from '@/config/env'
import { useParams } from 'react-router-dom'
import HighestBidTable from './components/highestBidTable'
import { BID_HISTORY_DATA } from './constant/table.const'
import BidHistory from './components/BidHistory'
import { cryptic } from '@/lib/utils'
import { useUsername } from './hooks/useUsername'
import PlaceABidModal from './components/PlaceABidModal'
import HighestOfferTable from './components/highestOfferTable'
import Timer from '@/components/ui/Timer'
import PlaceAnOfferModal from './components/placeAnOfferModal'
import { walletAddress } from '@/utils/username'
import { USERNAME_CONTRACT_ADDRESS } from './constant/config.const'
import { useNameTradeMakeNativeOffer } from '@/hooks/contract/useNameTradeOffersMutations'
import { useBaseAuth } from '@/hooks/auth/useBaseAuth'
import { parseEther } from 'viem'

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
      : walletAddress(decryptedTokenId ?? 'Username')

  const { switchToNameTradeChain } = useBaseAuth()
  const makeOfferMutation = useNameTradeMakeNativeOffer()

  const handleOfferSubmit = async (data: { offer: number }) => {
    const { offer } = data
    if (!tokenId) return
    if (!offer || Number(offer) <= 0) return

    try {
      await switchToNameTradeChain()
      const tx = await makeOfferMutation
        .mutateAsync({
          nft: USERNAME_CONTRACT_ADDRESS,
          tokenId,
          value: parseEther(String(offer)),
        })
        .catch(async (err) => {
          const msg = err instanceof Error ? err.message : String(err)
          const needsSwitch = /switch your wallet|wallet_switchethereumchain|chain/i.test(msg)
          if (needsSwitch) {
            await switchToNameTradeChain()
            return await makeOfferMutation.mutateAsync({
              nft: USERNAME_CONTRACT_ADDRESS,
              tokenId,
              value: parseEther(String(offer)),
            })
          }
          throw err
        })
      await tx.waitForReceipt()
    } catch (e) {
      // Optional: surface error via toast
    }
  }

  return (
    <Page>
      <div className="flex flex-col gap-5 mt-5">
        <div className="flex justify-between w-full">
          <Heading variant="h2" title={displayUsername} color="white" fontWeight={700} />
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex flex-col gap-2">
            <HighestOfferTable />
            <PlaceAnOfferModal
              username={displayUsername}
              onSubmit={handleOfferSubmit}
              loading={makeOfferMutation.isPending}
              disabled={makeOfferMutation.isPending}
            />
          </div>

          <div className="flex flex-col gap-2">
            <HighestBidTable />
            <PlaceABidModal username={displayUsername} />
            <div className="flex justify-center md:justify-end">
              <Timer targetDate={new Date(Date.now() + 1000 * 60 * 60 * 24)} />
            </div>
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
