import { useQuery } from '@tanstack/react-query'
import { usernameService } from '../services/UsernameService'

export interface UseUsernameOptions {
  tokenId?: string | null
  enabled?: boolean
}

export const USERNAME_QUERY_KEY = ['username', 'byTokenId'] as const

export const useUsername = (options: UseUsernameOptions) => {
  const isEnabled = Boolean((options.enabled ?? true) && options.tokenId)

  const query = useQuery({
    queryKey: [...USERNAME_QUERY_KEY, options.tokenId ?? 'unknown'],
    enabled: isEnabled,
    queryFn: async () => {
      if (!options.tokenId) {
        throw new Error('Token ID is required to fetch username')
      }

      return await usernameService.fetchUsernameByTokenId(options.tokenId)
    },
  })

  return {
    ...query,
    username: query.data ?? null,
  }
}
