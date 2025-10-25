import type { Address } from 'viem'
import type { UseMutationResult } from '@tanstack/react-query'
import { resolveDefaultNetwork } from '@/config/contract/config'
import { normalizeAddress, toBigInt } from '@/utils/address'
import { useNameTradeWriteMutation, type NameTradeWriteHookOptions } from '@/hooks/contract/useNameTradeWrite'
import type { NameTradeWriteResult, NameTradeOfferType } from '../../types/trade'

export interface UseNameTradeMakeNativeOfferVariables {
  nft: string | Address
  tokenId: bigint | number | string
  value: bigint | number | string
}

export const useNameTradeMakeNativeOffer = (
  options: NameTradeWriteHookOptions<UseNameTradeMakeNativeOfferVariables> = {}
): UseMutationResult<NameTradeWriteResult, Error, UseNameTradeMakeNativeOfferVariables> => {
  const resolvedNetwork = options.network ?? resolveDefaultNetwork()

  return useNameTradeWriteMutation<UseNameTradeMakeNativeOfferVariables>({
    ...options,
    functionName: 'makeNativeOffer',
    getArgs: (variables) => [normalizeAddress(variables.nft), toBigInt(variables.tokenId)],
    getValue: (variables) => toBigInt(variables.value),
    invalidateQueries: ({ variables }) => {
      const nft = normalizeAddress(variables.nft)
      const tokenId = toBigInt(variables.tokenId)
      const tokenIdStr = tokenId.toString()
      return [
        ['nameTrade', resolvedNetwork, 'getAllOffersForNft', nft, tokenId.toString()],
        ['nameTrade', resolvedNetwork, 'getOffer', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'offers', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'counterPrice', nft, tokenId],
        // Also invalidate string-keyed variants used by some read hooks
        ['nameTrade', resolvedNetwork, 'getOffer', nft, tokenIdStr],
        ['nameTrade', resolvedNetwork, 'offers', nft, tokenIdStr],
        ['nameTrade', resolvedNetwork, 'counterPrice', nft, tokenIdStr],
      ]
    },
  })
}

export interface UseNameTradeMakeNFTOfferVariables {
  nft: string | Address
  tokenId: bigint | number | string
  offerNfts: Array<string | Address>
  offerTokenIds: Array<bigint | number | string>
}

export const useNameTradeMakeNFTOffer = (
  options: NameTradeWriteHookOptions<UseNameTradeMakeNFTOfferVariables> = {}
): UseMutationResult<NameTradeWriteResult, Error, UseNameTradeMakeNFTOfferVariables> => {
  const resolvedNetwork = options.network ?? resolveDefaultNetwork()

  return useNameTradeWriteMutation<UseNameTradeMakeNFTOfferVariables>({
    ...options,
    functionName: 'makeNFTOffer',
    getArgs: (variables) => [
      normalizeAddress(variables.nft),
      toBigInt(variables.tokenId),
      variables.offerNfts.map((addr) => normalizeAddress(addr)),
      variables.offerTokenIds.map((id) => toBigInt(id)),
    ],
    invalidateQueries: ({ variables }) => {
      const nft = normalizeAddress(variables.nft)
      const tokenId = toBigInt(variables.tokenId)
      return [
        ['nameTrade', resolvedNetwork, 'getOffer', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'offers', nft, tokenId],
      ]
    },
  })
}

export interface UseNameTradeUpdateOfferVariables {
  nft: string | Address
  tokenId: bigint | number | string
  offerer: string | Address
  newAmount: bigint | number | string
  offerType: number | NameTradeOfferType
  value?: bigint | number | string
}

export const useNameTradeUpdateOffer = (
  options: NameTradeWriteHookOptions<UseNameTradeUpdateOfferVariables> = {}
): UseMutationResult<NameTradeWriteResult, Error, UseNameTradeUpdateOfferVariables> => {
  const resolvedNetwork = options.network ?? resolveDefaultNetwork()

  return useNameTradeWriteMutation<UseNameTradeUpdateOfferVariables>({
    ...options,
    functionName: 'updateOffer',
    getArgs: (variables) => [
      normalizeAddress(variables.nft),
      toBigInt(variables.tokenId),
      normalizeAddress(variables.offerer),
      toBigInt(variables.newAmount),
      BigInt(variables.offerType),
    ],
    getValue: (variables) =>
      variables.value !== undefined && variables.value !== null ? toBigInt(variables.value) : undefined,
    invalidateQueries: ({ variables }) => {
      const nft = normalizeAddress(variables.nft)
      const tokenId = toBigInt(variables.tokenId)
      const offerer = normalizeAddress(variables.offerer)
      const tokenIdStr = tokenId.toString()
      return [
        ['nameTrade', resolvedNetwork, 'getAllOffersForNft', nft, tokenIdStr],
        ['nameTrade', resolvedNetwork, 'getOffer', nft, tokenId, offerer],
        ['nameTrade', resolvedNetwork, 'offers', nft, tokenId, offerer],
        ['nameTrade', resolvedNetwork, 'counterPrice', nft, tokenId, offerer],
        // String-keyed variants
        ['nameTrade', resolvedNetwork, 'getOffer', nft, tokenIdStr, offerer],
        ['nameTrade', resolvedNetwork, 'offers', nft, tokenIdStr, offerer],
        ['nameTrade', resolvedNetwork, 'counterPrice', nft, tokenIdStr, offerer],
      ]
    },
  })
}

export interface UseNameTradeRemoveOfferVariables {
  nft: string | Address
  tokenId: bigint | number | string
  offerer: string | Address
}

export const useNameTradeRemoveOffer = (
  options: NameTradeWriteHookOptions<UseNameTradeRemoveOfferVariables> = {}
): UseMutationResult<NameTradeWriteResult, Error, UseNameTradeRemoveOfferVariables> => {
  const resolvedNetwork = options.network ?? resolveDefaultNetwork()

  return useNameTradeWriteMutation<UseNameTradeRemoveOfferVariables>({
    ...options,
    functionName: 'removeOffer',
    getArgs: (variables) => [
      normalizeAddress(variables.nft),
      toBigInt(variables.tokenId),
      normalizeAddress(variables.offerer),
    ],
    invalidateQueries: ({ variables }) => {
      const nft = normalizeAddress(variables.nft)
      const tokenId = toBigInt(variables.tokenId)
      const offerer = normalizeAddress(variables.offerer)
      return [
        ['nameTrade', resolvedNetwork, 'getOffer', nft, tokenId, offerer],
        ['nameTrade', resolvedNetwork, 'offers', nft, tokenId, offerer],
        ['nameTrade', resolvedNetwork, 'counterPrice', nft, tokenId, offerer],
      ]
    },
  })
}

export interface UseNameTradeAcceptOfferVariables {
  nft: string | Address
  tokenId: bigint | number | string
  offerer: string | Address
  value?: bigint | number | string
}

export const useNameTradeAcceptOffer = (
  options: NameTradeWriteHookOptions<UseNameTradeAcceptOfferVariables> = {}
): UseMutationResult<NameTradeWriteResult, Error, UseNameTradeAcceptOfferVariables> => {
  const resolvedNetwork = options.network ?? resolveDefaultNetwork()

  return useNameTradeWriteMutation<UseNameTradeAcceptOfferVariables>({
    ...options,
    functionName: 'acceptOffer',
    getArgs: (variables) => [
      normalizeAddress(variables.nft),
      toBigInt(variables.tokenId),
      normalizeAddress(variables.offerer),
    ],
    getValue: (variables) =>
      variables.value !== undefined && variables.value !== null ? toBigInt(variables.value) : undefined,
    invalidateQueries: ({ variables }) => {
      const nft = normalizeAddress(variables.nft)
      const tokenId = toBigInt(variables.tokenId)
      const offerer = normalizeAddress(variables.offerer)
      const tokenIdStr = tokenId.toString()
      return [
        ['nameTrade', resolvedNetwork, 'getListing', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'listings', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'getOffer', nft, tokenId, offerer],
        ['nameTrade', resolvedNetwork, 'offers', nft, tokenId, offerer],
        ['nameTrade', resolvedNetwork, 'counterPrice', nft, tokenId, offerer],
        // Offer lists and string-keyed variants
        ['nameTrade', resolvedNetwork, 'getAllOffersForNft', nft, tokenIdStr],
        ['nameTrade', resolvedNetwork, 'getOffer', nft, tokenIdStr, offerer],
        ['nameTrade', resolvedNetwork, 'offers', nft, tokenIdStr, offerer],
        ['nameTrade', resolvedNetwork, 'counterPrice', nft, tokenIdStr, offerer],
        // Owner refetch (token transferred on accept)
        ['nft', 'ownerOf', resolvedNetwork, nft, tokenIdStr],
      ]
    },
  })
}
