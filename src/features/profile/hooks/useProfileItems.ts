import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'
import { ProfileItemsServiceFactory } from '../services/ProfileItemsService'
import { ProfileItemsQueryBuilderFactory } from '../builders/ProfileItemsQueryBuilder'
import { ProfileItemsFormatterFactory } from '../formatters/ProfileItemsFormatter'
import type { ProfileItemsListResponse, ProfileItemsListVariables } from '../types/query'
import type { TProfileUsername } from '../types/profile'

export interface IProfileItemsService {
  fetchProfileItems(
    variables: ProfileItemsListVariables
  ): Promise<ProfileItemsListResponse['profileItems']>
}

export interface IProfileItemsQueryBuilder {
  buildVariables(options: ProfileItemsQueryOptions & { cursor?: string | null }): ProfileItemsListVariables
  buildQueryKey(options: ProfileItemsQueryOptions): readonly unknown[]
}

export interface IProfileItemsFormatter {
  formatItems(items: ProfileItemsListResponse['profileItems']['items']): TProfileUsername[]
}

export type ProfileItemsSortBy = ProfileItemsListVariables['sort']['by']
export type ProfileItemsSortDirection = ProfileItemsListVariables['sort']['direction']

export const PROFILE_ITEMS_QUERY_KEY = ['profileItems', 'basenames'] as const

export interface ProfileItemsQueryOptions {
  address: string
  limit?: number
  sortBy?: ProfileItemsSortBy
  sortDirection?: ProfileItemsSortDirection
  filter?: ProfileItemsListVariables['filter']
}

export interface UseProfileItemsOptions {
  address?: string | null
  limit?: number
  sortBy?: ProfileItemsSortBy
  sortDirection?: ProfileItemsSortDirection
  filter?: ProfileItemsListVariables['filter']
  enabled?: boolean
}

export const useProfileItems = (options: UseProfileItemsOptions) => {
  const service = ProfileItemsServiceFactory.create()
  const queryBuilder = ProfileItemsQueryBuilderFactory.create()
  const formatter = ProfileItemsFormatterFactory.create()

  const queryKey: readonly unknown[] = options.address
    ? queryBuilder.buildQueryKey({
        address: options.address,
        limit: options.limit,
        sortBy: options.sortBy,
        sortDirection: options.sortDirection,
        filter: options.filter,
      })
    : [...PROFILE_ITEMS_QUERY_KEY, 'anonymous']

  type ProfileItemsPage = {
    nextCursor: string | null
    rows: TProfileUsername[]
  }

  const query = useInfiniteQuery<
    ProfileItemsPage,
    Error,
    InfiniteData<ProfileItemsPage>,
    readonly unknown[],
    string | null
  >({
    queryKey,
    enabled: Boolean((options.enabled ?? true) && options.address),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    queryFn: async ({ pageParam }) => {
      if (!options.address) {
        throw new Error('Wallet address is required to fetch profile items')
      }

      const variables = queryBuilder.buildVariables({
        address: options.address,
        limit: options.limit,
        sortBy: options.sortBy,
        sortDirection: options.sortDirection,
        filter: options.filter,
        cursor: pageParam ?? null,
      })

      const profileItems = await service.fetchProfileItems(variables)

      return {
        nextCursor: profileItems.nextPageCursor,
        rows: formatter.formatItems(profileItems.items),
      }
    },
  })

  const rows = query.data?.pages.flatMap((page) => page.rows) ?? []

  return {
    ...query,
    rows,
    hasMore: Boolean(query.hasNextPage),
  }
}
