import { createPublicClient, createWalletClient, custom, http } from 'viem'
import type { NameTradeContractConfig, NameTradeNetwork, ResolveContractConfigOptions } from './config'
import { resolveNameTradeContractConfig } from './config'

type PublicClientCacheKey = `${NameTradeNetwork}:${string}`

const publicClientCache = new Map<PublicClientCacheKey, ReturnType<typeof createPublicClient>>()

const getCacheKey = (config: NameTradeContractConfig): PublicClientCacheKey => {
  return `${config.network}:${config.rpcUrl}` as const
}

export const getNameTradePublicClient = (
  options?: ResolveContractConfigOptions
) => {
  const config = resolveNameTradeContractConfig(options)
  const cacheKey = getCacheKey(config)

  if (publicClientCache.has(cacheKey)) {
    return publicClientCache.get(cacheKey)!
  }

  const client = createPublicClient({
    chain: config.chain,
    transport: http(config.rpcUrl, {
      fetchOptions: {
        cache: 'no-cache',
      },
    }),
  })

  publicClientCache.set(cacheKey, client)
  return client
}

export const getNameTradeWalletClient = (
  options?: ResolveContractConfigOptions
) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null
  }

  const config = resolveNameTradeContractConfig(options)

  return createWalletClient({
    chain: config.chain,
    transport: custom(window.ethereum),
  })
}
