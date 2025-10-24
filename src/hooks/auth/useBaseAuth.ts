import { useCallback, useMemo } from 'react'
import { createBaseAccountSDK } from '@base-org/account'
import { resolveNameTradeContractConfig } from '@/config/contract/config'
import { useAuth } from './useAuth'

export const useBaseAuth = () => {
  const { signIn, isLoading, error } = useAuth()

  const sdk = useMemo(() => {
    const { chain } = resolveNameTradeContractConfig()
    const instance = createBaseAccountSDK({
      appName: 'NameTrade',
      appLogoUrl: typeof window !== 'undefined' ? new URL('/vite.svg', window.location.origin).toString() : undefined,
      appChainIds: [chain.id],
    })
    if (typeof window !== 'undefined') {
      ;(window as any).nameTradeProvider = instance.getProvider()
    }
    return instance
  }, [])

  const signInWithBase = useCallback(async () => {
    if (isLoading) {
      return
    }

    try {
      const provider = sdk.getProvider()

      // Generate a unique nonce for SIWE
      const nonce = window.crypto.randomUUID().replace(/-/g, '')

      // Connect with signInWithEthereum capability
      const { chain } = resolveNameTradeContractConfig()
      const result = (await provider.request({
        method: 'wallet_connect',
        params: [
          {
            version: '1',
            capabilities: {
              signInWithEthereum: {
                nonce,
                chainId: `0x${chain.id.toString(16)}`,
              },
            },
          },
        ],
      })) as {
        accounts: Array<{
          address: string
          capabilities: {
            signInWithEthereum: {
              message: string
              signature: string
            }
          }
        }>
      }

      if (!result?.accounts?.[0]) {
        throw new Error('No account returned from Base provider')
      }

      const { address } = result.accounts[0]
      const { message, signature } = result.accounts[0].capabilities.signInWithEthereum

      await signIn({
        address,
        signature,
        message,
      })
    } catch (authError) {
      // Error handling is done in the useAuth hook
      console.error('Base authentication error:', authError)
    }
  }, [signIn, sdk, isLoading])

  const switchToNameTradeChain = useCallback(async () => {
    const anyWin: any = typeof window !== 'undefined' ? (window as any) : {}
    const eip1193: any = anyWin.nameTradeProvider || sdk.getProvider() || anyWin.ethereum
    const { chain, rpcUrl } = resolveNameTradeContractConfig()
    const chainIdHex = `0x${chain.id.toString(16)}`

    try {
      await eip1193.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      })
    } catch (switchError: any) {
      if (switchError?.code === 4902) {
        // Chain not added to wallet; try adding it first
        const addParams: any = {
          chainId: chainIdHex,
          chainName: chain.name,
          rpcUrls: [rpcUrl],
          nativeCurrency: chain.nativeCurrency,
          blockExplorerUrls: chain.blockExplorers?.default?.url ? [chain.blockExplorers.default.url] : undefined,
        }
        await eip1193.request({ method: 'wallet_addEthereumChain', params: [addParams] })
        // Retry switch after adding
        await eip1193.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chainIdHex }] })
      } else {
        throw switchError
      }
    }
  }, [sdk])

  return {
    signInWithBase,
    switchToNameTradeChain,
    isLoading,
    error,
  }
}
