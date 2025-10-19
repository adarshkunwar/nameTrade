import type { SignInRequest, SignInResponse, VerifyTokenRequest, VerifyTokenResponse } from '@/types/auth'

export const signInWithBase = async (request: SignInRequest): Promise<SignInResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock successful response
  return {
    accessToken: `mock_token_${Date.now()}`,
    refreshToken: `mock_refresh_${Date.now()}`,
    user: {
      id: `user_${request.address.slice(-8)}`,
      address: request.address,
      authMethod: 'base',
    },
  }
}

export const signInWithMock = async (): Promise<SignInResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock successful response for bypass mode
  return {
    accessToken: `mock_token_${Date.now()}`,
    refreshToken: `mock_refresh_${Date.now()}`,
    user: {
      id: 'mock_user',
      address: 'mock_address',
      authMethod: 'mock',
    },
  }
}

export const verifyToken = async (request: VerifyTokenRequest): Promise<VerifyTokenResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Mock token verification
  const isValid = request.token.startsWith('mock_token_')

  if (isValid) {
    return {
      isValid: true,
      user: {
        id: 'verified_user',
        address: 'verified_address',
        authMethod: 'base',
      },
    }
  }

  return {
    isValid: false,
  }
}

export const signOut = async (): Promise<void> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  // In a real app, you might call a logout endpoint
  // For now, just simulate success
}
