import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/config/store'
import { setAuthToken, clearAuthToken } from '@/config/store/authSlice'
import { signInWithBase, signOut as apiSignOut } from './api'
import type { SignInRequest } from '@/types/auth'

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>()
  const authState = useSelector((state: RootState) => state.auth)

  const signIn = useCallback(
    async (request: SignInRequest) => {
      if (authState.status === 'loading') {
        return
      }

      dispatch(setAuthToken({ status: 'loading', error: null }))

      try {
        const response = await signInWithBase(request)

        dispatch(
          setAuthToken({
            isAuthenticated: true,
            accessToken: response.accessToken,
            user_id: response.user.id,
            address: response.user.address,
            authMethod: response.user.authMethod,
            status: 'authenticated',
            error: null,
          })
        )
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Authentication failed. Please try again.'

        dispatch(
          setAuthToken({
            status: 'error',
            error: message,
            isAuthenticated: false,
          })
        )
      }
    },
    [dispatch, authState.status]
  )

  const signOut = useCallback(async () => {
    try {
      await apiSignOut()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      dispatch(clearAuthToken())
    }
  }, [dispatch])

  return {
    // State
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.status === 'loading',
    error: authState.error,
    user: {
      id: authState.user_id,
      address: authState.address,
      authMethod: authState.authMethod,
    },

    // Actions
    signIn,
    signOut,
  }
}
