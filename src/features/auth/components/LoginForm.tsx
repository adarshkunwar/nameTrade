import { useCallback } from 'react'
import { SignInWithBaseButton } from '@base-org/account-ui/react'
import { useBaseAuth } from '@/hooks/auth/useBaseAuth'
import { useAuth } from '@/hooks/auth/useAuth'
import { Spinner } from '@/components/ui/Spinner'

interface LoginFormProps {
  onSuccess?: () => void
  className?: string
}

export const LoginForm = ({ onSuccess, className = '' }: LoginFormProps) => {
  const { signInWithBase, isLoading: isBaseLoading, error: baseError } = useBaseAuth()
  const { signInWithMockAuth, isLoading: isMockLoading, error: mockError } = useAuth()

  const handleBaseSignIn = useCallback(async () => {
    await signInWithBase()
    onSuccess?.()
  }, [signInWithBase, onSuccess])

  const handleMockSignIn = useCallback(async () => {
    await signInWithMockAuth()
    onSuccess?.()
  }, [signInWithMockAuth, onSuccess])

  const isLoading = isBaseLoading || isMockLoading
  const error = baseError || mockError

  return (
    <div
      className={`w-full max-w-md rounded-3xl bg-[#0B0B0F] border border-[#182036] p-8 shadow-2xl shadow-blue-950/20 flex flex-col gap-6 ${className}`}
    >
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Sign in with Base</h1>
        <p className="text-sm text-[#9BA9C9]">
          Connect your Base account to unlock auctions, manage usernames, and access personalized insights.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <SignInWithBaseButton align="center" variant="solid" colorScheme="light" onClick={handleBaseSignIn} />
        {isLoading ? <Spinner /> : null}
      </div>

      {error ? (
        <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleMockSignIn}
          disabled={isLoading}
          className="text-xs font-medium uppercase tracking-wide text-[#7C8CAB] hover:text-[#A7B4D4] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue without signing in (UI preview mode)
        </button>
        <p className="text-xs text-[#5E6E95] text-center">
          Preview mode skips authentication while you design and test the experience. Sign in later to connect a real
          Base account.
        </p>
      </div>
    </div>
  )
}
