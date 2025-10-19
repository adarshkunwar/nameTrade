import { useAuth } from '@/hooks/auth/useAuth'

interface UserProfileProps {
  className?: string
  showSignOut?: boolean
}

export const UserProfile = ({ className = '', showSignOut = true }: UserProfileProps) => {
  const { user, signOut, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return null
  }

  const { address, authMethod } = user

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-white">{authMethod === 'mock' ? 'Preview Mode' : 'Connected'}</span>
        <span className="text-xs text-[#9BA9C9] font-mono">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown'}
        </span>
      </div>

      {showSignOut && (
        <button
          onClick={signOut}
          className="px-3 py-1 text-xs font-medium text-[#7C8CAB] hover:text-[#A7B4D4] transition border border-[#182036] rounded-lg hover:border-[#2A3A5C]"
        >
          Sign Out
        </button>
      )}
    </div>
  )
}
