import { useMemo } from 'react'
import { getNameTradePublicClient, getNameTradeWalletClient } from './clients'
import { resolveNameTradeContractConfig, type NameTradeContractConfig, type NameTradeNetwork } from './config'

export interface UseNameTradeContractOptions {
  network?: NameTradeNetwork
  rpcUrlOverride?: string
}

type PublicClientType = ReturnType<typeof getNameTradePublicClient>
type WalletClientType = ReturnType<typeof getNameTradeWalletClient>

export interface UseNameTradeContractResult {
  config: NameTradeContractConfig
  publicClient: PublicClientType
  walletClient: WalletClientType
}

export const useNameTradeContract = (options: UseNameTradeContractOptions = {}): UseNameTradeContractResult => {
  const { network, rpcUrlOverride } = options

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

  const walletClient = useMemo(
    () =>
      getNameTradeWalletClient({
        network,
        rpcUrlOverride,
      }),
    [network, rpcUrlOverride]
  )

  return {
    config,
    publicClient,
    walletClient,
  }
}
