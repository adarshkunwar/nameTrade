import { useMemo } from 'react'
import type { Address } from 'viem'
import { useNameTradeRead } from './useNameTradeRead'
import type { NameTradeListing, NameTradeApprovalStatus, NameTradeCounterPrice } from '@/types/trade'
import type { NameTradeNetwork } from '@/config/contract/config'
import { mapListing, normalizeAddress, toBigInt } from '@/utils/address'

export interface UseNameTradeListingOptions {
  nft?: string | Address | null
  tokenId?: bigint | number | string | null
  enabled?: boolean
  network?: NameTradeNetwork
  rpcUrlOverride?: string
}

export const useNameTradeListing = (options: UseNameTradeListingOptions) => {
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

  return useNameTradeRead<NameTradeListing | null>({
    functionName: 'getListing',
    args: preparedArgs ? [preparedArgs.nft, preparedArgs.tokenId] : undefined,
    enabled: Boolean(enabled && preparedArgs),
    network,
    rpcUrlOverride,
    select: (data) => mapListing(data),
  })
}

export interface UseNameTradeApprovalStatusOptions {
  nft?: string | Address | null
  tokenId?: bigint | number | string | null
  owner?: string | Address | null
  enabled?: boolean
  network?: NameTradeNetwork
  rpcUrlOverride?: string
}

export const useNameTradeApprovalStatus = (options: UseNameTradeApprovalStatusOptions) => {
  const { nft, tokenId, owner, enabled = true, network, rpcUrlOverride } = options

  const preparedArgs = useMemo(() => {
    if (!nft || !owner || tokenId === null || tokenId === undefined) {
      return null
    }

    try {
      return {
        nft: normalizeAddress(nft),
        tokenId: toBigInt(tokenId),
        owner: normalizeAddress(owner),
      }
    } catch {
      return null
    }
  }, [nft, owner, tokenId])

  return useNameTradeRead<NameTradeApprovalStatus>({
    functionName: 'approvalStatus',
    args: preparedArgs ? [preparedArgs.nft, preparedArgs.tokenId, preparedArgs.owner] : undefined,
    enabled: Boolean(enabled && preparedArgs),
    network,
    rpcUrlOverride,
    select: (value) => Boolean(value),
  })
}

export interface UseNameTradeCounterPriceOptions {
  nft?: string | Address | null
  tokenId?: bigint | number | string | null
  bidder?: string | Address | null
  enabled?: boolean
  network?: NameTradeNetwork
  rpcUrlOverride?: string
}

export const useNameTradeCounterPrice = (options: UseNameTradeCounterPriceOptions) => {
  const { nft, tokenId, bidder, enabled = true, network, rpcUrlOverride } = options

  const preparedArgs = useMemo(() => {
    if (!nft || !bidder || tokenId === null || tokenId === undefined) {
      return null
    }

    try {
      return {
        nft: normalizeAddress(nft),
        tokenId: toBigInt(tokenId),
        bidder: normalizeAddress(bidder),
      }
    } catch {
      return null
    }
  }, [nft, bidder, tokenId])

  return useNameTradeRead<NameTradeCounterPrice>({
    functionName: 'counterPrice',
    args: preparedArgs ? [preparedArgs.nft, preparedArgs.tokenId, preparedArgs.bidder] : undefined,
    enabled: Boolean(enabled && preparedArgs),
    network,
    rpcUrlOverride,
    select: (value) => toBigInt(value as bigint | number | string),
  })
}
