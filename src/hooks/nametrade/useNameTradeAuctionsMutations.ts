import type { Address } from 'viem'
import type { UseMutationResult } from '@tanstack/react-query'
import { resolveDefaultNetwork } from './config'
import { normalizeAddress, toBigInt } from './utils'
import type { NameTradeWriteResult } from './types'
import { useNameTradeWriteMutation, type NameTradeWriteHookOptions } from './useNameTradeWrite'

export interface UseNameTradeStartAuctionVariables {
  nft: string | Address
  tokenId: bigint | number | string
  reservePrice: bigint | number | string
  duration: bigint | number | string
}

export const useNameTradeStartAuction = (
  options: NameTradeWriteHookOptions<UseNameTradeStartAuctionVariables> = {}
): UseMutationResult<NameTradeWriteResult, Error, UseNameTradeStartAuctionVariables> => {
  const resolvedNetwork = options.network ?? resolveDefaultNetwork()

  return useNameTradeWriteMutation<UseNameTradeStartAuctionVariables>({
    ...options,
    functionName: 'startAuction',
    getArgs: (variables) => [
      normalizeAddress(variables.nft),
      toBigInt(variables.tokenId),
      toBigInt(variables.reservePrice),
      toBigInt(variables.duration),
    ],
    invalidateQueries: ({ variables }) => {
      const nft = normalizeAddress(variables.nft)
      const tokenId = toBigInt(variables.tokenId)
      return [
        ['nameTrade', resolvedNetwork, 'auctions', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'getAuction', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'getListing', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'listings', nft, tokenId],
      ]
    },
  })
}

export interface UseNameTradeBidVariables {
  nft: string | Address
  tokenId: bigint | number | string
  value: bigint | number | string
}

export const useNameTradeBid = (
  options: NameTradeWriteHookOptions<UseNameTradeBidVariables> = {}
): UseMutationResult<NameTradeWriteResult, Error, UseNameTradeBidVariables> => {
  const resolvedNetwork = options.network ?? resolveDefaultNetwork()

  return useNameTradeWriteMutation<UseNameTradeBidVariables>({
    ...options,
    functionName: 'bid',
    getArgs: (variables) => [normalizeAddress(variables.nft), toBigInt(variables.tokenId)],
    getValue: (variables) => toBigInt(variables.value),
    invalidateQueries: ({ variables }) => {
      const nft = normalizeAddress(variables.nft)
      const tokenId = toBigInt(variables.tokenId)
      return [
        ['nameTrade', resolvedNetwork, 'auctions', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'getAuction', nft, tokenId],
      ]
    },
  })
}

export interface UseNameTradeEndAuctionVariables {
  nft: string | Address
  tokenId: bigint | number | string
}

export const useNameTradeEndAuction = (
  options: NameTradeWriteHookOptions<UseNameTradeEndAuctionVariables> = {}
): UseMutationResult<NameTradeWriteResult, Error, UseNameTradeEndAuctionVariables> => {
  const resolvedNetwork = options.network ?? resolveDefaultNetwork()

  return useNameTradeWriteMutation<UseNameTradeEndAuctionVariables>({
    ...options,
    functionName: 'endAuction',
    getArgs: (variables) => [normalizeAddress(variables.nft), toBigInt(variables.tokenId)],
    invalidateQueries: ({ variables }) => {
      const nft = normalizeAddress(variables.nft)
      const tokenId = toBigInt(variables.tokenId)
      return [
        ['nameTrade', resolvedNetwork, 'auctions', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'getAuction', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'getListing', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'listings', nft, tokenId],
      ]
    },
  })
}

export interface UseNameTradeRefundAuctionBidsVariables {
  nft: string | Address
  tokenId: bigint | number | string
}

export const useNameTradeRefundAuctionBids = (
  options: NameTradeWriteHookOptions<UseNameTradeRefundAuctionBidsVariables> = {}
): UseMutationResult<NameTradeWriteResult, Error, UseNameTradeRefundAuctionBidsVariables> => {
  const resolvedNetwork = options.network ?? resolveDefaultNetwork()

  return useNameTradeWriteMutation<UseNameTradeRefundAuctionBidsVariables>({
    ...options,
    functionName: 'refundAuctionBids',
    getArgs: (variables) => [normalizeAddress(variables.nft), toBigInt(variables.tokenId)],
    invalidateQueries: ({ variables }) => {
      const nft = normalizeAddress(variables.nft)
      const tokenId = toBigInt(variables.tokenId)
      return [
        ['nameTrade', resolvedNetwork, 'auctions', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'getAuction', nft, tokenId],
      ]
    },
  })
}
