import { useMemo } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { ReadContractParameters } from 'viem'
import { getNameTradePublicClient } from '@/config/contract/client'
import { resolveNameTradeContractConfig, type NameTradeNetwork } from '@/config/contract/config'

export interface UseNameTradeReadOptions<TData> {
  functionName: ReadContractParameters['functionName']
  args?: ReadContractParameters['args']
  enabled?: boolean
  select?: (data: unknown) => TData
  network?: NameTradeNetwork
  rpcUrlOverride?: string
  queryKey?: readonly unknown[]
}

export const useNameTradeRead = <TData = unknown>(options: UseNameTradeReadOptions<TData>): UseQueryResult<TData> => {
  const { functionName, args, enabled = true, select, network, rpcUrlOverride, queryKey } = options

  const config = useMemo(
    () =>
      resolveNameTradeContractConfig({
        network,
        rpcUrlOverride,
      }),
    [network, rpcUrlOverride]
  )

  const publicClient = useMemo(
    () =>
      getNameTradePublicClient({
        network,
        rpcUrlOverride,
      }),
    [network, rpcUrlOverride]
  )

  return useQuery({
    queryKey: queryKey ?? ['nameTrade', config.network, functionName, ...(args ?? [])],
    enabled,
    queryFn: async () => {
      return await publicClient.readContract({
        address: config.address,
        abi: config.abi,
        functionName,
        args,
      })
    },
    select,
  })
}
