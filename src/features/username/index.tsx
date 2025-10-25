import { useMemo } from 'react';
import Page from '@/components/ui/Page'
import Heading from '@/components/ui/Typography'
import { ENV } from '@/config/env'
import { useParams } from 'react-router-dom'
import HighestBidTable from './components/highestBidTable'
import OfferHistory from './components/OfferHistory'
import { cryptic } from '@/lib/utils'
import { useUsername } from './hooks/useUsername'
import PlaceABidModal from './components/PlaceABidModal'
import HighestOfferTable from './components/highestOfferTable'
import Timer from '@/components/ui/Timer'
import PlaceAnOfferModal from './components/placeAnOfferModal'
import { walletAddress } from '@/utils/username'
import { USERNAME_CONTRACT_ADDRESS } from './constant/config.const'
import { useNameTradeBid } from '@/hooks/contract/useNameTradeAuctionsMutations';
import { useNameTradeMakeNativeOffer } from '@/hooks/contract/useNameTradeOffersMutations';
import { useGetAuction } from '@/hooks/contract/useGetAuction';
import { useEthToUsd } from '@/hooks/useEthToUsd';
import { useBaseAuth } from '@/hooks/auth/useBaseAuth';
import { formatEther, parseEther } from 'viem';
import { useQueryClient } from '@tanstack/react-query'
import Shimmer from '@/components/ui/Shimmer'
import { resolveDefaultNetwork } from '@/config/contract/config'

const Profile = () => {
  const { VITE_SUFFIX } = ENV

  const { tokenId: tokenIdParam } = useParams()
  const decryptedTokenId = cryptic().urlSafeDecrypt(tokenIdParam ?? '')
    const tokenId = decryptedTokenId || null;
  const tokenIdBigInt = tokenId ? BigInt(tokenId) : null;

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

  const { switchToNameTradeChain } = useBaseAuth();
  const makeOfferMutation = useNameTradeMakeNativeOffer();
  const bidMutation = useNameTradeBid();
  const { ethToUsdRate } = useEthToUsd();
  const queryClient = useQueryClient()
  const network = resolveDefaultNetwork()

  const { auction, isLoading: isAuctionLoading } = useGetAuction(
    '0x03c4738Ee98aE44591e1A4A4F3CaB6641d95DD9a',
    decryptedTokenId ?? '',
    {
      enabled: !!decryptedTokenId,
    },
  );

  const hasAuction = Boolean(auction && Number(auction.endTime) > 0)

  const auctionDetails = useMemo(() => {
    const formatUsd = (ethValue: bigint) => {
      if (ethToUsdRate === 0) return '$0.00';
      const eth = parseFloat(formatEther(ethValue));
      const usd = eth * ethToUsdRate;
      return `$${usd.toFixed(2)}`;
    };

    if (!auction) {
      return {
        highestBid: '0',
        highestBidUsd: '$0.00',
        bidStep: '0',
        bidStepUsd: '$0.00',
        minimumBid: '0',
        minimumBidUsd: '$0.00',
        endTime: null,
      };
    }

    const highestBid = auction.highestBid;
    const reservePrice = auction.reservePrice;
    let minimumBid: bigint;
    let bidStep: bigint;

    if (highestBid > 0) {
      bidStep = highestBid / 10n; // 10% of current highest bid
      minimumBid = highestBid + bidStep;
    } else {
      bidStep = reservePrice / 10n; // 10% of reserve price
      minimumBid = reservePrice; // First bid must meet reserve price
    }

    return {
      highestBid: formatEther(highestBid),
      highestBidUsd: formatUsd(highestBid),
      bidStep: formatEther(bidStep),
      bidStepUsd: formatUsd(bidStep),
      minimumBid: formatEther(minimumBid),
      minimumBidUsd: formatUsd(minimumBid),
      endTime: new Date(Number(auction.endTime) * 1000),
    };
  }, [auction, ethToUsdRate]);

  const handleBidSubmit = async (data: { bid: number }) => {
    const { bid } = data;
    if (!tokenId) return;
    if (!bid || Number(bid) <= 0) return;

    try {
      await switchToNameTradeChain();
      const tx = await bidMutation.mutateAsync({
        nft: '0x03c4738Ee98aE44591e1A4A4F3CaB6641d95DD9a',
        tokenId: tokenIdBigInt!,
        value: parseEther(String(bid)),
      });

      await tx.waitForReceipt();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['nameTrade', network, 'getAuction', '0x03c4738Ee98aE44591e1A4A4F3CaB6641d95DD9a', (tokenIdBigInt!).toString()] }),
        queryClient.invalidateQueries({ queryKey: ['nameTrade', network, 'auctions'] }),
      ])
    } catch (e) {
      // Optional: surface error via toast
    }
  };

  const handleOfferSubmit = async (data: { offer: number }) => {
    const { offer } = data;
    if (!tokenId) return;
    if (!offer || Number(offer) <= 0) return;

    try {
      await switchToNameTradeChain();
      const tx = await makeOfferMutation
        .mutateAsync({
          nft: USERNAME_CONTRACT_ADDRESS,
          tokenId: tokenIdBigInt!,
          value: parseEther(String(offer)),
        })
        .catch(async (err) => {
          const msg = err instanceof Error ? err.message : String(err);
          const needsSwitch = /switch your wallet|wallet_switchethereumchain|chain/i.test(msg);
          if (needsSwitch) {
            await switchToNameTradeChain();
            return await makeOfferMutation.mutateAsync({
              nft: USERNAME_CONTRACT_ADDRESS,
              tokenId: tokenIdBigInt!,
              value: parseEther(String(offer)),
            });
          }
          throw err;
        });
      await tx.waitForReceipt();
      console.log('[Offer] success: makeNativeOffer receipt confirmed');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['nameTrade', network, 'getAllOffersForNft', USERNAME_CONTRACT_ADDRESS, (tokenIdBigInt!).toString()] }),
        queryClient.invalidateQueries({ queryKey: ['nameTrade', network, 'getOffer', USERNAME_CONTRACT_ADDRESS, (tokenIdBigInt!).toString()] }),
        queryClient.invalidateQueries({ queryKey: ['nameTrade', network, 'offers'] }),
      ])
    } catch (e) {
      // Optional: surface error via toast
    }
  };

  return (
    <Page>
      <div className="flex flex-col gap-5 mt-5">
        <div className="flex justify-between w-full">
          {isUsernameFetching ? (
            <div className="py-1">
              <Shimmer height={28} width={260} rounded="lg" />
            </div>
          ) : (
            <Heading variant="h2" title={displayUsername} color="white" fontWeight={700} />
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex flex-col gap-2">
            {tokenIdBigInt && (
              <HighestOfferTable nft={USERNAME_CONTRACT_ADDRESS} tokenId={tokenIdBigInt} />
            )}
            <PlaceAnOfferModal
              username={displayUsername}
              onSubmit={handleOfferSubmit}
              loading={makeOfferMutation.isPending}
              disabled={makeOfferMutation.isPending}
            />
          </div>

          <div className="flex flex-col gap-2">
            <HighestBidTable
              highestBid={auctionDetails.highestBid}
              highestBidUsd={auctionDetails.highestBidUsd}
              bidStep={auctionDetails.bidStep}
              bidStepUsd={auctionDetails.bidStepUsd}
              minimumBid={auctionDetails.minimumBid}
              minimumBidUsd={auctionDetails.minimumBidUsd}
              isLoading={isAuctionLoading}
              isEmpty={!isAuctionLoading && !hasAuction}
              emptyMessage="No Auction Created"
            />
            {hasAuction && (
              <PlaceABidModal
                username={displayUsername}
                onSubmit={handleBidSubmit}
                loading={bidMutation.isPending}
                disabled={bidMutation.isPending}
              />
            )}
            {hasAuction && auctionDetails.endTime && (
              <div className="flex justify-center md:justify-end">
                <Timer targetDate={auctionDetails.endTime} />
              </div>
            )}
          </div>
        </div>
        <div>
                              {tokenIdBigInt && <OfferHistory nft={USERNAME_CONTRACT_ADDRESS} tokenId={tokenIdBigInt} />}
        </div>
      </div>
    </Page>
  )
}

export default Profile
