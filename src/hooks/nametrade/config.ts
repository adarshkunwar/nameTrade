import { base, baseSepolia } from 'viem/chains'
import type { Abi, Address, Chain } from 'viem'
import { NAME_TRADE_ABI, NAME_TRADE_CONTRACT_TESTNET_ADDRESS, NAME_TRADE_MAINNET_CONTRACT_ADDRESS } from '@/constants'
import { ENV } from '@/config/env'

export type NameTradeNetwork = 'mainnet' | 'testnet'

export interface NameTradeContractConfig {
  network: NameTradeNetwork
  address: Address
  abi: Abi
  chain: Chain
  rpcUrl: string
}

const DEFAULT_RPC_URLS: Record<NameTradeNetwork, string> = {
  mainnet: ENV.VITE_BASE_MAINNET_RPC_URL || 'https://mainnet.base.org',
  testnet: ENV.VITE_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
}

const CONTRACT_ADDRESSES: Record<NameTradeNetwork, Address> = {
  mainnet: NAME_TRADE_MAINNET_CONTRACT_ADDRESS as Address,
  testnet: NAME_TRADE_CONTRACT_TESTNET_ADDRESS as Address,
}

const CHAINS: Record<NameTradeNetwork, Chain> = {
  mainnet: base,
  testnet: baseSepolia,
}

export const resolveDefaultNetwork = (): NameTradeNetwork => {
  const network = (ENV.VITE_NAME_TRADE_NETWORK as NameTradeNetwork | undefined) ?? 'testnet'
  return network === 'mainnet' ? 'mainnet' : 'testnet'
}

export interface ResolveContractConfigOptions {
  network?: NameTradeNetwork
  rpcUrlOverride?: string
}

export const resolveNameTradeContractConfig = (
  options: ResolveContractConfigOptions = {}
): NameTradeContractConfig => {
  const network = options.network ?? resolveDefaultNetwork()

  return {
    network,
    address: CONTRACT_ADDRESSES[network],
    abi: NAME_TRADE_ABI as Abi,
    chain: CHAINS[network],
    rpcUrl: options.rpcUrlOverride ?? DEFAULT_RPC_URLS[network],
  }
}
