import { useQueries } from '@tanstack/react-query';
import { useNameTradeRead } from './useNameTradeRead';
import type { NftIdentifier } from '@/types';
import { mapListing } from '@/utils/address';
import { resolveNameTradeContractConfig, type NameTradeNetwork } from '@/config/contract/config';
import { getNameTradePublicClient } from '@/config/contract/client';
import type { NameTradeListing } from '@/types/trade';

export const useGetListedNfts = (options?: { network?: NameTradeNetwork; rpcUrlOverride?: string }) => {
  const { data: listedNfts, isLoading: isLoadingListedNfts } = useNameTradeRead<NftIdentifier[]>({ 
    functionName: 'getAllListedNfts',
    queryKey: ['nameTrade', options?.network, 'getAllListedNfts'],
    enabled: true,
    network: options?.network,
    rpcUrlOverride: options?.rpcUrlOverride,
  });

  const config = resolveNameTradeContractConfig(options);
  const publicClient = getNameTradePublicClient(options);

  const listingQueries = useQueries({
    queries:
      listedNfts?.map((nftId) => {
        return {
          queryKey: ['nameTrade', options?.network, 'getListing', nftId.nft, nftId.tokenId.toString()],
          queryFn: () =>
            publicClient.readContract({
              address: config.address,
              abi: config.abi,
              functionName: 'getListing',
              args: [nftId.nft, nftId.tokenId],
            }),
          select: mapListing,
          enabled: !!listedNfts && listedNfts.length > 0,
        };
      }) ?? [],
  });

  const listings = listingQueries.map((query) => query.data).filter(Boolean) as NameTradeListing[];
  const isLoadingListings = listingQueries.some((query) => query.isLoading);

  return {
    listings,
    isLoading: isLoadingListedNfts || isLoadingListings,
  };
};
