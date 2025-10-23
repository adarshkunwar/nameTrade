import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'
import { getNameTradePublicClient } from './clients'
import { resolveNameTradeContractConfig, type NameTradeNetwork } from './config'
import { useNameTradeRead } from './useNameTradeRead'
import { normalizeAddress, toBigInt } from './utils'

export interface NameTradeConstants {
  platformFeeBps: number
  platformFeeRecipient: Address
  minBidIncrementBps: bigint
  absoluteMinBid: bigint
  auctionTimeExtension: bigint
  auctionExtensionThreshold: bigint
  offerExpiryTime: bigint
}

export interface UseNameTradeConstantsOptions {
  enabled?: boolean
  network?: NameTradeNetwork
  rpcUrlOverride?: string
}

export const useNameTradeConstants = (options: UseNameTradeConstantsOptions = {}) => {
  const { enabled = true, network, rpcUrlOverride } = options

  const config = useMemo(
    () =>
      resolveNameTradeContractConfig({
        network,
        rpcUrlOverride,
      }),
    [network, rpcUrlOverride]
  )

  const client = useMemo(
    () =>
      getNameTradePublicClient({
        network,
        rpcUrlOverride,
      }),
    [network, rpcUrlOverride]
  )

  return useQuery({
    queryKey: ['nameTrade', config.network, 'constants'],
    enabled,
    queryFn: async (): Promise<NameTradeConstants> => {
      const [
        platformFeeBpsRaw,
        platformFeeRecipientRaw,
        minBidIncrementBpsRaw,
        absoluteMinBidRaw,
        auctionTimeExtensionRaw,
        auctionExtensionThresholdRaw,
        offerExpiryTimeRaw,
      ] = await Promise.all([
        client.readContract({
          address: config.address,
          abi: config.abi,
          functionName: 'PLATFORM_FEE_BPS',
        }) as Promise<bigint>,
        client.readContract({
          address: config.address,
          abi: config.abi,
          functionName: 'PLATFORM_FEE_RECIPIENT',
        }) as Promise<Address>,
        client.readContract({
          address: config.address,
          abi: config.abi,
          functionName: 'MIN_BID_INCREMENT_BPS',
        }) as Promise<bigint>,
        client.readContract({
          address: config.address,
          abi: config.abi,
          functionName: 'ABSOLUTE_MIN_BID',
        }) as Promise<bigint>,
        client.readContract({
          address: config.address,
          abi: config.abi,
          functionName: 'AUCTION_TIME_EXTENSION',
        }) as Promise<bigint>,
        client.readContract({
          address: config.address,
          abi: config.abi,
          functionName: 'AUCTION_EXTENSION_THRESHOLD',
        }) as Promise<bigint>,
        client.readContract({
          address: config.address,
          abi: config.abi,
          functionName: 'OFFER_EXPIRY_TIME',
        }) as Promise<bigint>,
      ])

      return {
        platformFeeBps: Number(platformFeeBpsRaw),
        platformFeeRecipient: normalizeAddress(platformFeeRecipientRaw),
        minBidIncrementBps: toBigInt(minBidIncrementBpsRaw),
        absoluteMinBid: toBigInt(absoluteMinBidRaw),
        auctionTimeExtension: toBigInt(auctionTimeExtensionRaw),
        auctionExtensionThreshold: toBigInt(auctionExtensionThresholdRaw),
        offerExpiryTime: toBigInt(offerExpiryTimeRaw),
      }
    },
  })
}

export interface UseNameTradeOwnerOptions {
  enabled?: boolean
  network?: NameTradeNetwork
  rpcUrlOverride?: string
}

export const useNameTradeOwner = (options: UseNameTradeOwnerOptions = {}) => {
  const { enabled = true, network, rpcUrlOverride } = options

  return useNameTradeRead<Address>({
    functionName: 'owner',
    enabled,
    network,
    rpcUrlOverride,
    select: (value) => normalizeAddress(value as string),
  })
}
