import { useMutation, useQueryClient, type UseMutationOptions, type UseMutationResult } from '@tanstack/react-query'
import { getNameTradePublicClient, getNameTradeWalletClient } from '@/config/contract/client'
import { resolveNameTradeContractConfig, type NameTradeNetwork } from '@/config/contract/config'
import type { NameTradeWriteResult } from '@/types/trade'

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
      let walletClient = getNameTradeWalletClient({
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

      let chainId = await walletClient.getChainId?.()
      if (chainId && chainId !== contractConfig.chain.id) {
        const targetHex = `0x${contractConfig.chain.id.toString(16)}`
        const anyWin: any = typeof window !== 'undefined' ? (window as any) : {}
        const eip1193: any = anyWin.nameTradeProvider || anyWin.ethereum || null
        if (eip1193?.request) {
          try {
            await eip1193.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: targetHex }] })
          } catch (switchError: any) {
            if (switchError?.code === 4902) {
              const addParams: any = {
                chainId: targetHex,
                chainName: contractConfig.chain.name,
                rpcUrls: [contractConfig.rpcUrl],
                nativeCurrency: contractConfig.chain.nativeCurrency,
                blockExplorerUrls: contractConfig.chain.blockExplorers?.default?.url
                  ? [contractConfig.chain.blockExplorers.default.url]
                  : undefined,
              }
              await eip1193.request({ method: 'wallet_addEthereumChain', params: [addParams] })
              await eip1193.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: targetHex }] })
            } else {
              throw new Error(`Switch your wallet to the ${contractConfig.chain.name} network to continue.`)
            }
          }
          for (let i = 0; i < 10; i++) {
            try {
              const cidHex = await eip1193.request({ method: 'eth_chainId' })
              const cidNum = typeof cidHex === 'string' ? parseInt(cidHex, 16) : cidHex
              if (cidNum === contractConfig.chain.id) break
            } catch {}
            await new Promise((r) => setTimeout(r, 250))
          }
          
          
          
          
          
          // Recreate wallet client after chain switch
          const switchedClient = getNameTradeWalletClient({
            network: config.network,
            rpcUrlOverride: config.rpcUrlOverride,
          })
          walletClient = switchedClient ?? walletClient
          chainId = await walletClient.getChainId?.()
        }
        if (chainId !== contractConfig.chain.id) {
          throw new Error(`Switch your wallet to the ${contractConfig.chain.name} network to continue.`)
        }
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
    onSuccess: async (result, variables, context, mutation) => {
      const invalidateDescriptors =
        typeof config.invalidateQueries === 'function'
          ? config.invalidateQueries({ variables, result })
          : config.invalidateQueries

      if (invalidateDescriptors?.length) {
        await Promise.all(invalidateDescriptors.map((key) => queryClient.invalidateQueries({ queryKey: key })))
      }
      await onSuccess?.(result, variables, context, mutation)
    },
    onError: async (error, variables, context, mutation) => {
      await onError?.(error, variables, context, mutation)
    },
    onSettled: async (result, error, variables, context, mutation) => {
      await onSettled?.(result, error, variables, context, mutation)
    },
  })
}
