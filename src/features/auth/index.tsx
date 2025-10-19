import { useCallback, useMemo } from 'react'
import { SignInWithBaseButton } from '@base-org/account-ui/react'
import { createBaseAccountSDK } from '@base-org/account'
import { base } from 'viem/chains'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/config/store'
import { setAuthToken } from '@/config/store/authSlice'
import { Spinner } from '@/components/ui/Spinner'

const Login = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { status, error } = useSelector((state: RootState) => state.auth)

  const sdk = useMemo(
    () =>
      createBaseAccountSDK({
        appName: 'NameTrade',
        appLogoUrl: typeof window !== 'undefined' ? new URL('/vite.svg', window.location.origin).toString() : undefined,
        appChainIds: [base.id],
      }),
    []
  )

  const handleSignIn = useCallback(async () => {
    if (status === 'loading') {
      return
    }

    dispatch(setAuthToken({ status: 'loading', error: null }))

    try {
      const provider = sdk.getProvider()
      
      // Generate a unique nonce for SIWE
      const nonce = window.crypto.randomUUID().replace(/-/g, '')
      
      // Connect with signInWithEthereum capability
      const result = await provider.request({
        method: 'wallet_connect',
        params: [{
          version: '1',
          capabilities: {
            signInWithEthereum: {
              nonce,
              chainId: `0x${base.id.toString(16)}`,
            }
          }
        }]
      }) as {
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

      dispatch(
        setAuthToken({
          isAuthenticated: true,
          address,
          signature,
          authMessage: message,
          authMethod: 'base',
          status: 'authenticated',
          error: null,
        })
      )
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : 'Authentication failed. Please try again.'

      dispatch(
        setAuthToken({
          status: 'error',
          error: message,
          isAuthenticated: false,
        })
      )
    }
  }, [dispatch, sdk, status])

  const handleBypass = useCallback(() => {
    dispatch(
      setAuthToken({
        isAuthenticated: true,
        authMethod: 'mock',
        address: null,
        signature: null,
        authMessage: null,
        status: 'authenticated',
        error: null,
      })
    )
  }, [dispatch])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl bg-[#0B0B0F] border border-[#182036] p-8 shadow-2xl shadow-blue-950/20 flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in with Base</h1>
          <p className="text-sm text-[#9BA9C9]">
            Connect your Base account to unlock auctions, manage usernames, and access personalized insights.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <SignInWithBaseButton
            align="center"
            variant="solid"
            colorScheme="light"
            onClick={handleSignIn}
          />
          {status === 'loading' ? <Spinner /> : null}
        </div>

        {error ? (
          <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleBypass}
            className="text-xs font-medium uppercase tracking-wide text-[#7C8CAB] hover:text-[#A7B4D4] transition"
          >
            Continue without signing in (UI preview mode)
          </button>
          <p className="text-xs text-[#5E6E95] text-center">
            Preview mode skips authentication while you design and test the experience. Sign in later to connect a real
            Base account.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
