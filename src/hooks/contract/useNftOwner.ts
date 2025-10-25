import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'
import { getNameTradePublicClient } from '@/config/contract/client'
import { resolveDefaultNetwork, type NameTradeNetwork } from '@/config/contract/config'

const erc721OwnerOfAbi = [
  {
    type: 'function',
    name: 'ownerOf',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: 'owner', type: 'address' }],
  },
] as const

export const useNftOwner = (
  nft: Address,
  tokenId: bigint | string,
  options?: { enabled?: boolean; network?: NameTradeNetwork; rpcUrlOverride?: string },
) => {
  const network = options?.network ?? resolveDefaultNetwork()
  const publicClient = getNameTradePublicClient({ network, rpcUrlOverride: options?.rpcUrlOverride })

  const { data: owner, isLoading } = useQuery<Address | null>({
    queryKey: ['nft', 'ownerOf', network, nft, tokenId.toString()],
    enabled: (options?.enabled ?? true) && Boolean(nft && tokenId),
    queryFn: async () => {
      try {
        const owner = await publicClient.readContract({
          address: nft,
          abi: erc721OwnerOfAbi,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        })
        return owner as Address
      } catch (_) {
        return null
      }
    },
    staleTime: 30_000,
  })

  return { owner, isLoading }
}
