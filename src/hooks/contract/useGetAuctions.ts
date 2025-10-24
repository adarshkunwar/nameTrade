import { useQueries } from '@tanstack/react-query';
import { useNameTradeRead } from './useNameTradeRead';
import type { NftIdentifier } from '@/types';
import type { NameTradeAuction } from '@/types/trade';
import { mapAuction } from '@/utils/address';
import { resolveNameTradeContractConfig, type NameTradeNetwork } from '@/config/contract/config';
import { getNameTradePublicClient } from '@/config/contract/client';

export const useGetAuctions = (options?: { network?: NameTradeNetwork; rpcUrlOverride?: string }) => {
  const { data: activeAuctions, isLoading: isLoadingActiveAuctions } = useNameTradeRead<NftIdentifier[]>({
    functionName: 'getAllActiveAuctions',
    queryKey: ['nameTrade', options?.network, 'getAllActiveAuctions'],
    enabled: true,
    network: options?.network,
    rpcUrlOverride: options?.rpcUrlOverride,
  });

  const config = resolveNameTradeContractConfig(options);
  const publicClient = getNameTradePublicClient(options);

  const auctionQueries = useQueries({
    queries:
      activeAuctions?.map((auctionId) => {
        return {
          queryKey: ['nameTrade', options?.network, 'getAuction', auctionId.nft, auctionId.tokenId.toString()],
          queryFn: () =>
            publicClient.readContract({
              address: config.address,
              abi: config.abi,
              functionName: 'getAuction',
              args: [auctionId.nft, auctionId.tokenId],
            }),
          select: mapAuction,
          enabled: !!activeAuctions && activeAuctions.length > 0,
        };
      }) ?? [],
  });

        const auctions = auctionQueries.map((query) => query.data).filter(Boolean) as NameTradeAuction[];
  const isLoadingAuctions = auctionQueries.some((query) => query.isLoading);

  return {
    auctions,
    isLoading: isLoadingActiveAuctions || isLoadingAuctions,
  };
};


