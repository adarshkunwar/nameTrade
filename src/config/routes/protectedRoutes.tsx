import { type ReactNode } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/config/store'
import { LoginForm } from '@/features/auth/components/LoginForm'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  redirectTo?: string
}

export const AuthGuard = ({ children, fallback }: AuthGuardProps) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 text-white">
        <LoginForm />
      </div>
    )
  }

  return <>{children}</>
}
