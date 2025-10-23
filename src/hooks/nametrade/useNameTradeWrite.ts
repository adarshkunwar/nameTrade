import { useMutation, useQueryClient, type UseMutationOptions, type UseMutationResult } from '@tanstack/react-query'
import { getNameTradePublicClient, getNameTradeWalletClient } from './clients'
import { resolveNameTradeContractConfig, type NameTradeNetwork } from './config'
import type { NameTradeWriteResult } from './types'

type InvalidateQueries<TVariables> =
  | readonly unknown[][]
  | ((params: { variables: TVariables; result: NameTradeWriteResult }) => readonly unknown[][])

export interface NameTradeWriteHookOptions<TVariables> {
  network?: NameTradeNetwork
  rpcUrlOverride?: string
  mutationOptions?: Omit<UseMutationOptions<NameTradeWriteResult, Error, TVariables, unknown>, 'mutationFn'>
}

export interface CreateNameTradeWriteMutationConfig<TVariables> extends NameTradeWriteHookOptions<TVariables> {
  functionName: string
  getArgs: (variables: TVariables) => readonly unknown[]
  getValue?: (variables: TVariables) => bigint | undefined
  mutationKey?: readonly unknown[]
  invalidateQueries?: InvalidateQueries<TVariables>
}

export const useNameTradeWriteMutation = <TVariables>(
  config: CreateNameTradeWriteMutationConfig<TVariables>
): UseMutationResult<NameTradeWriteResult, Error, TVariables> => {
  const queryClient = useQueryClient()

  const { onSuccess, onError, onSettled, ...restMutationOptions } = config.mutationOptions ?? {}

  return useMutation<NameTradeWriteResult, Error, TVariables>({
    ...restMutationOptions,
    mutationKey: config.mutationKey,
    mutationFn: async (variables) => {
      const args = config.getArgs(variables)
      const walletClient = getNameTradeWalletClient({
        network: config.network,
        rpcUrlOverride: config.rpcUrlOverride,
      })

      if (!walletClient) {
        throw new Error('Wallet client unavailable. Connect a compatible wallet to continue.')
      }

      const contractConfig = resolveNameTradeContractConfig({
        network: config.network,
        rpcUrlOverride: config.rpcUrlOverride,
      })

      const publicClient = getNameTradePublicClient({
        network: config.network,
        rpcUrlOverride: config.rpcUrlOverride,
      })

      const chainId = await walletClient.getChainId?.()
      if (chainId && chainId !== contractConfig.chain.id) {
        throw new Error(`Switch your wallet to the ${contractConfig.chain.name} network to continue.`)
      }

      let [account] = await walletClient.getAddresses()
      if (!account) {
        const requested = await walletClient.requestAddresses()
        account = requested[0]
      }

      if (!account) {
        throw new Error('No wallet address available from the connected provider.')
      }

      const value = config.getValue?.(variables)
      const hash = await walletClient.writeContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: config.functionName as any,
        args,
        account,
        chain: contractConfig.chain,
        value,
      })

      return {
        hash,
        waitForReceipt: async () => {
          return await publicClient.waitForTransactionReceipt({ hash })
        },
      }
    },
    onSuccess: async (result, variables, context) => {
      const invalidateDescriptors =
        typeof config.invalidateQueries === 'function'
          ? config.invalidateQueries({ variables, result })
          : config.invalidateQueries

      if (invalidateDescriptors?.length) {
        await Promise.all(
          invalidateDescriptors.map((key) =>
            queryClient.invalidateQueries({ queryKey: key })
          )
        )
      }
      await onSuccess?.(result, variables, context)
    },
    onError: async (error, variables, context) => {
      await onError?.(error, variables, context)
    },
    onSettled: async (result, error, variables, context) => {
      await onSettled?.(result, error, variables, context)
    },
  })
}
