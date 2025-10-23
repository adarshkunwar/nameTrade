import type { Address } from 'viem'
import type { UseMutationResult } from '@tanstack/react-query'
import { resolveDefaultNetwork } from './config'
import { normalizeAddress } from './utils'
import type { NameTradeWriteResult } from './types'
import { useNameTradeWriteMutation, type NameTradeWriteHookOptions } from './useNameTradeWrite'

export const useNameTradeRenounceOwnership = (
  options: NameTradeWriteHookOptions<void> = {}
): UseMutationResult<NameTradeWriteResult, Error, void> => {
  const resolvedNetwork = options.network ?? resolveDefaultNetwork()

  return useNameTradeWriteMutation<void>({
    ...options,
    functionName: 'renounceOwnership',
    getArgs: () => [],
    invalidateQueries: () => [['nameTrade', resolvedNetwork, 'owner']],
  })
}

export interface UseNameTradeTransferOwnershipVariables {
  newOwner: string | Address
}

export const useNameTradeTransferOwnership = (
  options: NameTradeWriteHookOptions<UseNameTradeTransferOwnershipVariables> = {}
): UseMutationResult<NameTradeWriteResult, Error, UseNameTradeTransferOwnershipVariables> => {
  const resolvedNetwork = options.network ?? resolveDefaultNetwork()

  return useNameTradeWriteMutation<UseNameTradeTransferOwnershipVariables>({
    ...options,
    functionName: 'transferOwnership',
    getArgs: (variables) => [normalizeAddress(variables.newOwner)],
    invalidateQueries: () => [['nameTrade', resolvedNetwork, 'owner']],
  })
}
