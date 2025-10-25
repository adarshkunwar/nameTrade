import { useQuery } from '@tanstack/react-query'
import { ProfileItemsServiceFactory } from '../services/ProfileItemsService'
import type { TBaseUsername, TBaseUsernamesResponse } from '../types/basenames'

export interface IProfileItemsService {
  fetchProfileItems(address: string): Promise<TBaseUsernamesResponse>
}

export const PROFILE_ITEMS_QUERY_KEY = ['profileItems', 'basenames'] as const

export interface UseProfileItemsOptions {
  address?: string | null
  enabled?: boolean
}

export const useProfileItems = (options: UseProfileItemsOptions) => {
  const service = ProfileItemsServiceFactory.create()

  const queryKey = [PROFILE_ITEMS_QUERY_KEY, options.address]

  const query = useQuery<TBaseUsernamesResponse, Error, TBaseUsername[]>({
    queryKey,
    enabled: Boolean((options.enabled ?? true) && options.address),
    queryFn: async () => {
      if (!options.address) {
        throw new Error('Wallet address is required to fetch profile items')
      }
      return service.fetchProfileItems(options.address)
    },
    select: (data) => data.data,
  })

  return {
    ...query,
    rows: query.data ?? [],
  }
}
