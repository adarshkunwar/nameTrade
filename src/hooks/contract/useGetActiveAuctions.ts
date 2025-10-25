import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { resolveNameTradeContractConfig, type NameTradeNetwork } from '@/config/contract/config';
import { getNameTradePublicClient } from '@/config/contract/client';
import { mapAuction } from '@/utils/address';
import { getNameFromTokenId } from '@/features/home/api/getNameFromTokenId';
import type { NameTradeAuction } from '@/types/trade';

export const useGetActiveAuctions = (options?: { network?: NameTradeNetwork; rpcUrlOverride?: string }) => {
  const config = useMemo(
    () => resolveNameTradeContractConfig(options),
    [options?.network, options?.rpcUrlOverride],
  );
  const publicClient = useMemo(() => getNameTradePublicClient(options), [options?.network, options?.rpcUrlOverride]);

  const { data: auctions = [], isLoading } = useQuery<NameTradeAuction[]>({ 
    queryKey: ['nameTrade', options?.network, 'getAllActiveAuctionsWithDetails'],
    staleTime: 30_000,
    queryFn: async () => {
      try {
        const rawAuctions = await publicClient.readContract({
          address: config.address,
          abi: config.abi,
          functionName: 'getAllActiveAuctions',
        });

        if (!Array.isArray(rawAuctions) || rawAuctions.length === 0) {
          return [];
        }

        const results: NameTradeAuction[] = [];

        for (const entry of rawAuctions as { nft: Address; tokenId: bigint }[]) {
          const { nft, tokenId } = entry;

          try {
            const auctionRaw = await publicClient.readContract({
              address: config.address,
              abi: config.abi,
              functionName: 'getAuction',
              args: [nft, tokenId],
            });

            const auction = mapAuction(auctionRaw);
            if (!auction) {
              continue;
            }

            const name = await getNameFromTokenId(tokenId.toString());

            results.push({ ...auction, name });
          } catch (auctionErr) {
            console.error(`[useGetActiveAuctions] Error fetching auction for NFT:`, { nft, tokenId: tokenId.toString() }, auctionErr);
          }
        }

        return results;
      } catch (err) {
        console.error('[useGetActiveAuctions] A critical error occurred:', err);
        throw err;
      }
    },
  });

  return {
    auctions,
    isLoading,
  };
};
