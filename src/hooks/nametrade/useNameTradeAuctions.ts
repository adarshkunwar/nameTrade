import { useMemo } from 'react'
import type { Address } from 'viem'
import { useNameTradeRead } from './useNameTradeRead'
import type { NameTradeAuction } from './types'
import type { NameTradeNetwork } from './config'
import { mapAuction, normalizeAddress, toBigInt } from './utils'

export interface UseNameTradeAuctionOptions {
  nft?: string | Address | null
  tokenId?: bigint | number | string | null
  enabled?: boolean
  network?: NameTradeNetwork
  rpcUrlOverride?: string
}

export const useNameTradeAuction = (options: UseNameTradeAuctionOptions) => {
  const { nft, tokenId, enabled = true, network, rpcUrlOverride } = options

  const preparedArgs = useMemo(() => {
    if (!nft || tokenId === null || tokenId === undefined) {
      return null
    }

    try {
      return {
        nft: normalizeAddress(nft),
        tokenId: toBigInt(tokenId),
      }
    } catch {
      return null
    }
  }, [nft, tokenId])

  return useNameTradeRead<NameTradeAuction | null>({
    functionName: 'getAuction',
    args: preparedArgs ? [preparedArgs.nft, preparedArgs.tokenId] : undefined,
    enabled: Boolean(enabled && preparedArgs),
    network,
    rpcUrlOverride,
    select: (data) => mapAuction(data),
  })
}

export const useNameTradeAuctionSnapshot = (options: UseNameTradeAuctionOptions) => {
  const { nft, tokenId, enabled = true, network, rpcUrlOverride } = options

  const preparedArgs = useMemo(() => {
    if (!nft || tokenId === null || tokenId === undefined) {
      return null
    }

    try {
      return {
        nft: normalizeAddress(nft),
        tokenId: toBigInt(tokenId),
      }
    } catch {
      return null
    }
  }, [nft, tokenId])

  return useNameTradeRead<NameTradeAuction | null>({
    functionName: 'auctions',
    args: preparedArgs ? [preparedArgs.nft, preparedArgs.tokenId] : undefined,
    enabled: Boolean(enabled && preparedArgs),
    network,
    rpcUrlOverride,
    select: (data) => mapAuction(data),
  })
}
