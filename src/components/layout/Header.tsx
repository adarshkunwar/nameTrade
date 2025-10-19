import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Heading from '../ui/Typography'
import type { RootState } from '@/config/store'
import { clearAuthToken } from '@/config/store/authSlice'

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { isAuthenticated, address, authMethod } = useSelector((state: RootState) => state.auth)

  const displayName = useMemo(() => {
    if (authMethod === 'mock') {
      return 'Preview Mode'
    }

    if (address) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    return 'Not signed in'
  }, [address, authMethod])

  const handleSignOut = useCallback(() => {
    dispatch(clearAuthToken())
    navigate('/login', { replace: true })
  }, [dispatch, navigate])

  const handleNavigateToLogin = useCallback(() => {
    navigate('/login')
  }, [navigate])

  return (
    <header className="bg-header py-4 px-8 flex justify-between items-center sticky top-0 z-10">
      <Heading variant="h1" title="NameTrade" color="white" fontWeight={700} />
      <div className="flex items-center gap-6 text-sm">
        <div className="flex flex-col items-end">
          <span className="text-xs uppercase tracking-wide text-[#9BA9C9]">Status</span>
          <span className="text-sm font-semibold text-white">{displayName}</span>
        </div>
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
            onClick={handleNavigateToLogin}
            className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white/40 hover:bg-white/10"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
