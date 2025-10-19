import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Heading from '../ui/Typography'
import type { RootState } from '@/config/store'
import { clearAuthToken } from '@/config/store/authSlice'
import { useBaseAuth } from '@/hooks/auth/useBaseAuth'
import { shorten } from '@/utils/username'

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { signInWithBase, isLoading: isSigningIn, error: signInError } = useBaseAuth()

  const { isAuthenticated, address } = useSelector((state: RootState) => state.auth)

  const displayName = useMemo(() => {
    if (address) {
      return shorten(address)
    }
    return 'Guest'
  }, [address])

  const handleSignOut = useCallback(() => {
    dispatch(clearAuthToken())
  }, [dispatch])

  const handleNavigateHome = useCallback(() => {
    navigate('/')
  }, [navigate])

  const handleNavigateToProfile = useCallback(() => {
    if (address) {
      navigate(`/profile/${address}`)
    }
  }, [address, navigate])

  const handleSignIn = useCallback(() => {
    void signInWithBase()
  }, [signInWithBase])

  return (
    <header className="bg-header py-4 px-8 flex justify-between items-center sticky top-0 z-10">
      <Heading variant="h1" title="NameTrade" color="white" fontWeight={700} onClick={handleNavigateHome} />
      <div className="flex items-center gap-4 text-sm">
        <span className="text-sm font-semibold text-white">{displayName}</span>
        {isAuthenticated && address ? (
          <button
            type="button"
            onClick={handleNavigateToProfile}
            className="rounded-full border border-white/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white/60 hover:bg-white/10"
          >
            My Profile
          </button>
        ) : null}
        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full border border-white/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white/60 hover:bg-white/10"
          >
            Sign out
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white/40 hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Sign in with Base"
            title={signInError ?? 'Sign in with Base'}
          >
            {isSigningIn ? 'Connecting…' : 'Sign in'}
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
