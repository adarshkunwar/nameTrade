import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { resolveNameTradeContractConfig, type NameTradeNetwork } from '@/config/contract/config';
import { getNameTradePublicClient } from '@/config/contract/client';
import { mapAuction } from '@/utils/address';
import type { NameTradeAuction } from '@/types/trade';

export const useGetAuction = (
  nftAddress: Address,
  tokenId: string,
  options?: { network?: NameTradeNetwork; rpcUrlOverride?: string; enabled?: boolean },
) => {
  const config = useMemo(
    () => resolveNameTradeContractConfig(options),
    [options?.network, options?.rpcUrlOverride],
  );
  const publicClient = useMemo(() => getNameTradePublicClient(options), [options?.network, options?.rpcUrlOverride]);

  const { data: auction, isLoading } = useQuery<NameTradeAuction | null>({ 
    queryKey: ['nameTrade', options?.network, 'getAuction', nftAddress, tokenId],
    staleTime: 30_000,
    queryFn: async () => {
      try {
        const auctionRaw = await publicClient.readContract({
          address: config.address,
          abi: config.abi,
          functionName: 'getAuction',
          args: [nftAddress, BigInt(tokenId)],
        });

        const auction = mapAuction(auctionRaw);
        return auction;
      } catch (err) {
        console.error('[useGetAuction] A critical error occurred:', err);
        // If the auction does not exist, the contract may revert. Return null in that case.
        return null;
      }
    },
    enabled: options?.enabled ?? (!!nftAddress && !!tokenId),
  });

  return {
    auction,
    isLoading,
  };
};
