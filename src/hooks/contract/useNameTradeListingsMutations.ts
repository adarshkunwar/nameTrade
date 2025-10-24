import type { Address } from 'viem'
import type { UseMutationResult } from '@tanstack/react-query'
import { resolveDefaultNetwork } from '@/config/contract/config'
import type { NameTradeNetwork } from '@/config/contract/config'
import { normalizeAddress, toBigInt } from '@/utils/address'
import type { NameTradeWriteResult } from '@/types/trade'
import { useNameTradeWriteMutation, type NameTradeWriteHookOptions } from '@/hooks/contract/useNameTradeWrite'

export interface UseNameTradeListVariables {
  nft: string | Address
  tokenId: bigint | number | string
  price: bigint | number | string
}

export const useNameTradeList = (
  options: NameTradeWriteHookOptions<UseNameTradeListVariables> = {}
): UseMutationResult<NameTradeWriteResult, Error, UseNameTradeListVariables> => {
  const resolvedNetwork = options.network ?? resolveDefaultNetwork()

  return useNameTradeWriteMutation<UseNameTradeListVariables>({
    ...options,
    functionName: 'list',
    getArgs: (variables) => {
      return [normalizeAddress(variables.nft), toBigInt(variables.tokenId), toBigInt(variables.price)]
    },
    invalidateQueries: ({ variables }) => {
      const nft = normalizeAddress(variables.nft)
      const tokenId = toBigInt(variables.tokenId)
      return [
        ['nameTrade', resolvedNetwork, 'getListing', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'listings', nft, tokenId],
      ]
    },
  })
}

export interface UseNameTradeListWithAllowedBuyersVariables extends UseNameTradeListVariables {
  allowedBuyers: Array<string | Address>
}

export const useNameTradeListWithAllowedBuyers = (
  options: NameTradeWriteHookOptions<UseNameTradeListWithAllowedBuyersVariables> = {}
): UseMutationResult<NameTradeWriteResult, Error, UseNameTradeListWithAllowedBuyersVariables> => {
  const resolvedNetwork = options.network ?? resolveDefaultNetwork()

  return useNameTradeWriteMutation<UseNameTradeListWithAllowedBuyersVariables>({
    ...options,
    functionName: 'listWithAllowedBuyers',
    getArgs: (variables) => {
      return [
        normalizeAddress(variables.nft),
        toBigInt(variables.tokenId),
        toBigInt(variables.price),
        variables.allowedBuyers.map((buyer) => normalizeAddress(buyer)),
      ]
    },
    invalidateQueries: ({ variables }) => {
      const nft = normalizeAddress(variables.nft)
      const tokenId = toBigInt(variables.tokenId)
      return [
        ['nameTrade', resolvedNetwork, 'getListing', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'listings', nft, tokenId],
      ]
    },
  })
}

export interface UseNameTradeUpdateAllowedBuyersVariables {
  nft: string | Address
  tokenId: bigint | number | string
  allowedBuyers: Array<string | Address>
}

export const useNameTradeUpdateAllowedBuyers = (
  options: NameTradeWriteHookOptions<UseNameTradeUpdateAllowedBuyersVariables> = {}
): UseMutationResult<NameTradeWriteResult, Error, UseNameTradeUpdateAllowedBuyersVariables> => {
  const resolvedNetwork = options.network ?? resolveDefaultNetwork()

  return useNameTradeWriteMutation<UseNameTradeUpdateAllowedBuyersVariables>({
    ...options,
    functionName: 'updateAllowedBuyers',
    getArgs: (variables) => {
      return [
        normalizeAddress(variables.nft),
        toBigInt(variables.tokenId),
        variables.allowedBuyers.map((buyer) => normalizeAddress(buyer)),
      ]
    },
    invalidateQueries: ({ variables }) => {
      const nft = normalizeAddress(variables.nft)
      const tokenId = toBigInt(variables.tokenId)
      return [['nameTrade', resolvedNetwork, 'getListing', nft, tokenId]]
    },
  })
}

export interface UseNameTradeCancelVariables {
  nft: string | Address;
  tokenId: bigint | number | string;
}

export const useNameTradeCancel = (
  options: NameTradeWriteHookOptions<UseNameTradeCancelVariables> = {},
): UseMutationResult<NameTradeWriteResult, Error, UseNameTradeCancelVariables> => {
  const resolvedNetwork = options.network ?? resolveDefaultNetwork();

  return useNameTradeWriteMutation<UseNameTradeCancelVariables>({
    ...options,
    functionName: 'cancelListing',
    getArgs: (variables) => {
      return [normalizeAddress(variables.nft), toBigInt(variables.tokenId)];
    },
    invalidateQueries: ({ variables }) => {
      const nft = normalizeAddress(variables.nft);
      const tokenId = toBigInt(variables.tokenId);
      return [
        ['nameTrade', resolvedNetwork, 'getListing', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'listings', nft, tokenId],
      ];
    },
  });
};

export interface UseNameTradeCancelListingVariables {
  nft: string | Address
  tokenId: bigint | number | string
}

export const useNameTradeCancelListing = (
  options: NameTradeWriteHookOptions<UseNameTradeCancelListingVariables> = {}
): UseMutationResult<NameTradeWriteResult, Error, UseNameTradeCancelListingVariables> => {
  const resolvedNetwork = options.network ?? resolveDefaultNetwork()

  return useNameTradeWriteMutation<UseNameTradeCancelListingVariables>({
    ...options,
    functionName: 'cancelListing',
    getArgs: (variables) => {
      return [normalizeAddress(variables.nft), toBigInt(variables.tokenId)]
    },
    invalidateQueries: ({ variables }) => {
      const nft = normalizeAddress(variables.nft)
      const tokenId = toBigInt(variables.tokenId)
      return [
        ['nameTrade', resolvedNetwork, 'getListing', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'listings', nft, tokenId],
      ]
    },
  })
}

export interface UseNameTradeBuyVariables {
  nft: string | Address
  tokenId: bigint | number | string
  value: bigint | number | string
}

export const useNameTradeBuy = (
  options: NameTradeWriteHookOptions<UseNameTradeBuyVariables> = {}
): UseMutationResult<NameTradeWriteResult, Error, UseNameTradeBuyVariables> => {
  const resolvedNetwork: NameTradeNetwork = options.network ?? resolveDefaultNetwork()

  return useNameTradeWriteMutation<UseNameTradeBuyVariables>({
    ...options,
    functionName: 'buy',
    getArgs: (variables) => {
      return [normalizeAddress(variables.nft), toBigInt(variables.tokenId)]
    },
    getValue: (variables) => toBigInt(variables.value),
    invalidateQueries: ({ variables }) => {
      const nft = normalizeAddress(variables.nft)
      const tokenId = toBigInt(variables.tokenId)
      return [
        ['nameTrade', resolvedNetwork, 'getListing', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'listings', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'offers'],
        ['nameTrade', resolvedNetwork, 'getOffer'],
        ['nameTrade', resolvedNetwork, 'auctions', nft, tokenId],
        ['nameTrade', resolvedNetwork, 'getAuction', nft, tokenId],
      ]
    },
  })
}
