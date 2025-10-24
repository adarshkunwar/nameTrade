import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mapListing, mapOffer } from '@/utils/address';
import { resolveNameTradeContractConfig, type NameTradeNetwork } from '@/config/contract/config';
import { getNameTradePublicClient } from '@/config/contract/client';
import type { NameTradeListing, NameTradeOffer } from '@/types/trade';
import type { Address } from 'viem';

export const useGetListedNfts = (options?: { network?: NameTradeNetwork; rpcUrlOverride?: string }) => {
  const config = useMemo(
    () => resolveNameTradeContractConfig(options),
    [options?.network, options?.rpcUrlOverride],
  );
  const publicClient = useMemo(
    () => getNameTradePublicClient(options),
    [options?.network, options?.rpcUrlOverride],
  );

  const {
    data: listings = [],
    isLoading,
  } = useQuery<NameTradeListing[]>({
    queryKey: ['nameTrade', options?.network, 'getAllListedNftsWithDetails'],
    staleTime: 30_000,
    queryFn: async () => {
      try {
        const rawNfts = await publicClient.readContract({
          address: config.address,
          abi: config.abi,
          functionName: 'getAllListedNfts',
        });
        if (!Array.isArray(rawNfts) || rawNfts.length === 0) {
          return [];
        }

        const listedNfts = (rawNfts as unknown[])
          .map((entry) => {
            if (!entry) {
              return null;
            }

            // viem may return tuples or struct-like objects depending on ABI encoding
            if (Array.isArray(entry)) {
              const [nft, tokenId] = entry as [Address, bigint];
              if (!nft || tokenId === undefined || tokenId === null) {
                return null;
              }
              return { nft, tokenId: BigInt(tokenId) };
            }

            if (typeof entry === 'object') {
              const obj = entry as Record<string, unknown>;
              const nft = (obj.nft ?? obj[0]) as Address | undefined;
              const tokenIdValue = obj.tokenId ?? obj[1];
              if (!nft || tokenIdValue === undefined || tokenIdValue === null) {
                return null;
              }
              try {
                const tokenId = typeof tokenIdValue === 'bigint' ? tokenIdValue : BigInt(tokenIdValue as string | number);
                return { nft, tokenId };
              } catch (conversionError) {
                return null;
              }
            }

            return null;
          })
          .filter((item): item is { nft: Address; tokenId: bigint } => Boolean(item?.nft && item?.tokenId !== undefined));

        if (listedNfts.length === 0) {
          return [];
        }
        const results: NameTradeListing[] = [];

        for (const { nft, tokenId } of listedNfts) {
          try {
            const listingRaw = await publicClient.readContract({
              address: config.address,
              abi: config.abi,
              functionName: 'getListing',
              args: [nft, tokenId],
            });
            const listing = mapListing(listingRaw);
            if (!listing) {
              continue;
            }

            let offers: NameTradeOffer[] = [];
            try {
              const offerers = await publicClient.readContract({
                address: config.address,
                abi: config.abi,
                functionName: 'getAllOffersForNft',
                args: [nft, tokenId],
              });
              const offerList = await Promise.all(
                (offerers as Address[]).map(async (offerer) => {
                  try {
                    const offerRaw = await publicClient.readContract({
                      address: config.address,
                      abi: config.abi,
                      functionName: 'getOffer',
                      args: [nft, tokenId, offerer],
                    });
                    return mapOffer(offerRaw);
                  } catch (offerErr) {
                    return null;
                  }
                }),
              );

              offers = offerList.filter(Boolean) as NameTradeOffer[];
            } catch (offerersErr) {
              // Silently fail if offers can't be fetched
            }

            results.push({ ...listing, offers });
          } catch (listingErr) {
            // Silently fail if a single listing can't be fetched
          }
        }

        return results;
      } catch (err) {
        console.error('[useGetListedNfts] A critical error occurred:', err);
        throw err;
      }
    },
  });

  return {
    listings,
    isLoading,
  };
};
