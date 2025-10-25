import { useQueries } from '@tanstack/react-query';
import { useNameTradeRead } from './useNameTradeRead';
import { mapOffer } from '@/utils/address';
import { resolveNameTradeContractConfig, resolveDefaultNetwork, type NameTradeNetwork } from '@/config/contract/config';
import { getNameTradePublicClient } from '@/config/contract/client';
import type { NameTradeOffer } from '@/types/trade';

export const useGetOffers = (nft: `0x${string}`, tokenId: bigint, options?: { network?: NameTradeNetwork; rpcUrlOverride?: string }) => {
  const network = options?.network ?? resolveDefaultNetwork();
  const { data: offerers, isLoading: isLoadingOfferers } = useNameTradeRead<`0x${string}`[]>({
    functionName: 'getAllOffersForNft',
    args: [nft, tokenId],
    queryKey: ['nameTrade', network, 'getAllOffersForNft', nft, tokenId.toString()],
    enabled: !!nft && !!tokenId,
    network,
    rpcUrlOverride: options?.rpcUrlOverride,
  });

  if (offerers) {
    // Step 1 debug log
    console.log('[useGetOffers][step1:getAllOffersForNft]', {
      network,
      nft,
      tokenId: tokenId.toString(),
      offerers,
      count: offerers.length,
    });
  }

  const config = resolveNameTradeContractConfig({ ...options, network });
  const publicClient = getNameTradePublicClient({ ...options, network });

  const offerQueries = useQueries({
    queries:
      offerers?.map((offerer) => {
        return {
          queryKey: ['nameTrade', network, 'getOffer', nft, tokenId.toString(), offerer],
          queryFn: async () => {
            const raw = await publicClient.readContract({
              address: config.address,
              abi: config.abi,
              functionName: 'getOffer',
              args: [nft, tokenId, offerer],
            })
            // Step 2 debug log (raw)
            console.log('[useGetOffers][step2:getOffer:raw]', {
              network,
              nft,
              tokenId: tokenId.toString(),
              offerer,
              raw,
            })
            return raw
          },
          select: (data) => {
            const mapped = mapOffer(data)
            // Step 2 debug log (mapped)
            console.log('[useGetOffers][step2:getOffer:mapped]', mapped)
            return mapped
          },
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
