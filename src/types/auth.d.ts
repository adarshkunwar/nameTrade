export type SignInRequest = {
  address: string
  signature: string
  message: string
}

export type SignInResponse = {
  accessToken: string
  refreshToken?: string
  user: {
    id: string
    address: string
    authMethod: 'base'
  }
}

export type VerifyTokenRequest = {
  token: string
}

export type VerifyTokenResponse = {
  isValid: boolean
  user?: {
    id: string
    address: string
    authMethod: 'base'
  }
}

export type AuthError = {
  message: string
  code?: string
  status?: number
}
