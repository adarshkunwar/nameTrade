import axios, { type AxiosError } from 'axios'
import { store } from '@/config/store'

export const AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || '',
  headers: {
    Accept: '*/*',
    'Content-Type': 'application/json',
  },
  timeout: isNaN(Number(import.meta.env.VITE_APP_API_TIMEOUT)) ? 10000 : Number(import.meta.env.VITE_APP_API_TIMEOUT),
})

// Request interceptor
AxiosInstance.interceptors.request.use(
  (config: any) => {
    const state = store.getState().auth
    const { accessToken, guestToken } = state

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    } else if (guestToken) {
      config.headers.Authorization = `Bearer ${guestToken}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)
