import { useMemo } from 'react'
import type { Address } from 'viem'
import { useNameTradeRead } from './useNameTradeRead'
import type { NameTradeOffer } from '@/types/trade'
import type { NameTradeNetwork } from '@/config/contract/config'
import { mapOffer, normalizeAddress, toBigInt } from '@/utils/address'

export interface UseNameTradeOfferOptions {
  nft?: string | Address | null
  tokenId?: bigint | number | string | null
  offerer?: string | Address | null
  enabled?: boolean
  network?: NameTradeNetwork
  rpcUrlOverride?: string
}

export const useNameTradeOffer = (options: UseNameTradeOfferOptions) => {
  const { nft, tokenId, offerer, enabled = true, network, rpcUrlOverride } = options

  const preparedArgs = useMemo(() => {
    if (!nft || !offerer || tokenId === null || tokenId === undefined) {
      return null
    }

    try {
      return {
        nft: normalizeAddress(nft),
        tokenId: toBigInt(tokenId),
        offerer: normalizeAddress(offerer),
      }
    } catch {
      return null
    }
  }, [nft, tokenId, offerer])

  return useNameTradeRead<NameTradeOffer | null>({
    functionName: 'getOffer',
    args: preparedArgs ? [preparedArgs.nft, preparedArgs.tokenId, preparedArgs.offerer] : undefined,
    enabled: Boolean(enabled && preparedArgs),
    network,
    rpcUrlOverride,
    select: (data) => mapOffer(data),
  })
}

export const useNameTradeOfferSnapshot = (options: UseNameTradeOfferOptions) => {
  const { nft, tokenId, offerer, enabled = true, network, rpcUrlOverride } = options

  const preparedArgs = useMemo(() => {
    if (!nft || !offerer || tokenId === null || tokenId === undefined) {
      return null
    }

    try {
      return {
        nft: normalizeAddress(nft),
        tokenId: toBigInt(tokenId),
        offerer: normalizeAddress(offerer),
      }
    } catch {
      return null
    }
  }, [nft, tokenId, offerer])

  return useNameTradeRead<NameTradeOffer | null>({
    functionName: 'offers',
    args: preparedArgs ? [preparedArgs.nft, preparedArgs.tokenId, preparedArgs.offerer] : undefined,
    enabled: Boolean(enabled && preparedArgs),
    network,
    rpcUrlOverride,
    select: (data) => mapOffer(data),
  })
}
