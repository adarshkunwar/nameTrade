import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { encryptedLocalStorage } from '@/utils/encryptedLocalStorage'
interface AuthState {
  accessToken: string | null
  guestToken: string | null
  isAuthenticated: boolean
  user_id: string | null
  displayName: string | null
  address: string | null
  signature: string | null
  authMessage: string | null
  authMethod: 'base' | 'mock' | null
  status: 'idle' | 'loading' | 'authenticated' | 'error'
  error: string | null
}

const parseStoredJson = <T>(value: string | null): T | null => {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as T
  } catch (error) {
    console.error('Failed to parse stored JSON value:', error)
    return null
  }
}

const initialState: AuthState = {
  accessToken: encryptedLocalStorage.getItem('accessToken') ?? null,
  guestToken: encryptedLocalStorage.getItem('guestToken') ?? null,
  isAuthenticated: encryptedLocalStorage.getItem('isAuthenticated') ? true : false,
  user_id: parseStoredJson<string>(encryptedLocalStorage.getItem('user_id')),
  address: encryptedLocalStorage.getItem('wallet_address') ?? null,
  signature: encryptedLocalStorage.getItem('wallet_signature') ?? null,
  authMessage: encryptedLocalStorage.getItem('wallet_auth_message') ?? null,
  authMethod: parseStoredJson<'base' | 'mock'>(encryptedLocalStorage.getItem('auth_method')),
  status: 'idle',
  error: null,
  displayName: '',
}

const TokenSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthToken: (
      state,
      action: PayloadAction<{
        accessToken?: string | null
        guestToken?: string | null
        isAuthenticated?: boolean
        user_id?: string | null
        address?: string | null
        signature?: string | null
        authMessage?: string | null
        authMethod?: 'base' | 'mock' | null
        status?: AuthState['status']
        error?: string | null
      }>
    ) => {
      const {
        accessToken,
        guestToken,
        isAuthenticated,
        user_id,
        address,
        signature,
        authMessage,
        authMethod,
        status,
        error,
      } = action.payload
      if (accessToken !== undefined) {
        state.accessToken = accessToken
        encryptedLocalStorage.setItem('accessToken', accessToken || '')
      }

      if (guestToken !== undefined) {
        state.guestToken = guestToken
        encryptedLocalStorage.setItem('guestToken', guestToken || '')
      }

      if (isAuthenticated !== undefined) {
        state.isAuthenticated = isAuthenticated
        encryptedLocalStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated))
      }
      if (user_id !== undefined) {
        state.user_id = user_id
        encryptedLocalStorage.setItem('user_id', JSON.stringify(user_id))
      }
      if (address !== undefined) {
        state.address = address
        if (address) {
          encryptedLocalStorage.setItem('wallet_address', address)
        } else {
          encryptedLocalStorage.removeItem('wallet_address')
        }
      }
      if (signature !== undefined) {
        state.signature = signature
        if (signature) {
          encryptedLocalStorage.setItem('wallet_signature', signature)
        } else {
          encryptedLocalStorage.removeItem('wallet_signature')
        }
      }
      if (authMessage !== undefined) {
        state.authMessage = authMessage
        if (authMessage) {
          encryptedLocalStorage.setItem('wallet_auth_message', authMessage)
        } else {
          encryptedLocalStorage.removeItem('wallet_auth_message')
        }
      }
      if (authMethod !== undefined) {
        state.authMethod = authMethod
        if (authMethod) {
          encryptedLocalStorage.setItem('auth_method', JSON.stringify(authMethod))
        } else {
          encryptedLocalStorage.removeItem('auth_method')
        }
      }
      if (status !== undefined) {
        state.status = status
      }
      if (error !== undefined) {
        state.error = error
      }
    },
    clearAuthToken: (state) => {
      state.accessToken = null
      state.guestToken = null
      state.user_id = null
      state.isAuthenticated = false
      state.address = null
      state.signature = null
      state.authMessage = null
      state.authMethod = null
      state.status = 'idle'
      state.error = null

      try {
        encryptedLocalStorage.removeItem('accessToken')
        encryptedLocalStorage.removeItem('guestToken')
        encryptedLocalStorage.removeItem('user_id')
        encryptedLocalStorage.removeItem('wallet_address')
        encryptedLocalStorage.removeItem('wallet_signature')
        encryptedLocalStorage.removeItem('wallet_auth_message')
        encryptedLocalStorage.removeItem('auth_method')
        localStorage.removeItem('isAuthenticated')
        localStorage.clear()
      } catch (error) {
        console.error('Failed to clear localStorage:', error)
      }
    },
  },
})

export const { setAuthToken, clearAuthToken } = TokenSlice.actions
export default TokenSlice.reducer
