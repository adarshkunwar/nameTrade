import { useCallback, useMemo } from 'react'
import { createBaseAccountSDK } from '@base-org/account'
import { base } from 'viem/chains'
import { useAuth } from './useAuth'

export const useBaseAuth = () => {
  const { signIn, isLoading, error } = useAuth()

  const sdk = useMemo(
    () =>
      createBaseAccountSDK({
        appName: 'NameTrade',
        appLogoUrl: typeof window !== 'undefined' ? new URL('/vite.svg', window.location.origin).toString() : undefined,
        appChainIds: [base.id],
      }),
    []
  )

  const signInWithBase = useCallback(async () => {
    if (isLoading) {
      return
    }

    try {
      const provider = sdk.getProvider()

      // Generate a unique nonce for SIWE
      const nonce = window.crypto.randomUUID().replace(/-/g, '')

      // Connect with signInWithEthereum capability
      const result = (await provider.request({
        method: 'wallet_connect',
        params: [
          {
            version: '1',
            capabilities: {
              signInWithEthereum: {
                nonce,
                chainId: `0x${base.id.toString(16)}`,
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

  return {
    signInWithBase,
    isLoading,
    error,
  }
}
