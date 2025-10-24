import { useQueries } from '@tanstack/react-query';
import { useNameTradeRead } from './useNameTradeRead';
import { mapOffer } from '@/utils/address';
import { resolveNameTradeContractConfig, type NameTradeNetwork } from '@/config/contract/config';
import { getNameTradePublicClient } from '@/config/contract/client';
import type { NameTradeOffer } from '@/types/trade';

export const useGetOffers = (nft: `0x${string}`, tokenId: bigint, options?: { network?: NameTradeNetwork; rpcUrlOverride?: string }) => {
  const { data: offerers, isLoading: isLoadingOfferers } = useNameTradeRead<`0x${string}`[]>({
    functionName: 'getAllOffersForNft',
    args: [nft, tokenId],
    queryKey: ['nameTrade', options?.network, 'getAllOffersForNft', nft, tokenId.toString()],
    enabled: !!nft && !!tokenId,
    network: options?.network,
    rpcUrlOverride: options?.rpcUrlOverride,
  });

  const config = resolveNameTradeContractConfig(options);
  const publicClient = getNameTradePublicClient(options);

  const offerQueries = useQueries({
    queries:
      offerers?.map((offerer) => {
        return {
          queryKey: ['nameTrade', options?.network, 'getOffer', nft, tokenId.toString(), offerer],
          queryFn: () =>
            publicClient.readContract({
              address: config.address,
              abi: config.abi,
              functionName: 'getOffer',
              args: [nft, tokenId, offerer],
            }),
          select: mapOffer,
          enabled: !!offerers && offerers.length > 0,
        };
      }) ?? [],
  });

  const offers = offerQueries.map((query) => query.data).filter(Boolean) as NameTradeOffer[];
  const isLoadingOffers = offerQueries.some((query) => query.isLoading);

  return {
    offers,
    isLoading: isLoadingOfferers || isLoadingOffers,
  };
};
