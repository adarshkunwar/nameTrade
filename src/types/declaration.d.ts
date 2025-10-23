import type { EIP1193Provider } from 'viem'

declare module 'crypto-js'

declare global {
  interface Window {
    ethereum?: EIP1193Provider
  }
}
