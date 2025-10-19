import { useQuery, useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'
import type { CollectionItemsListVariables } from '../types/query'
import type { TUsername } from '../types/username'
import { CollectionServiceFactory } from '../services/CollectionService'
import { CollectionQueryBuilderFactory } from '../builders/CollectionQueryBuilder'
import { CollectionFormatterFactory } from '../formatters/CollectionFormatter'

// ===== INTERFACES (Interface Segregation Principle) =====
export interface ICollectionService {
  fetchCollectionItems(variables: CollectionItemsListVariables): Promise<{
    items: any[]
    nextPageCursor: string | null
  }>
}

export interface ICollectionQueryBuilder {
  buildVariables(options: CollectionOptions): CollectionItemsListVariables
  buildQueryKey(options: CollectionOptions): readonly unknown[]
}

export interface ICollectionFormatter {
  formatItems(items: any[]): TUsername[]
}

// ===== TYPES =====
export type CollectionItemsSortBy = CollectionItemsListVariables['sort']['by']
export type CollectionItemsSortDirection = CollectionItemsListVariables['sort']['direction']

export const COLLECTION_ITEMS_QUERY_KEY = ['collectionItems', 'basenames'] as const

// ===== CONFIGURATION (Single Responsibility) =====
export interface CollectionOptions {
  sortBy: CollectionItemsSortBy
  sortDirection: CollectionItemsSortDirection
  limit?: number
  filter?: CollectionItemsListVariables['filter']
  collectionSlug?: string
  address?: string | null
  enabled?: boolean
  cursor?: string
}

export interface SearchCollectionOptions {
  searchTerm: string
  limit?: number
  sortBy?: CollectionItemsSortBy
  sortDirection?: CollectionItemsSortDirection
  collectionSlug?: string
  address?: string | null
  enabled?: boolean
}

// ===== BASIC COLLECTION HOOK (Single Responsibility) =====
export const useCollection = (variables: CollectionItemsListVariables) => {
  const service = CollectionServiceFactory.create()

  return useQuery({
    queryKey: ['collectionItems', variables.cursor],
    queryFn: async () => await service.fetchCollectionItems(variables),
    enabled: Boolean(variables.cursor),
  })
}

// ===== INFINITE COLLECTION HOOK (Single Responsibility) =====
export const useCollectionItems = (options: CollectionOptions) => {
  const service = CollectionServiceFactory.create()
  const queryBuilder = CollectionQueryBuilderFactory.create()
  const formatter = CollectionFormatterFactory.create()

  const queryKey = queryBuilder.buildQueryKey(options)

  type CollectionItemsPage = {
    nextCursor: string | null
    rows: TUsername[]
  }

  const query = useInfiniteQuery<
    CollectionItemsPage,
    Error,
    InfiniteData<CollectionItemsPage>,
    typeof queryKey,
    string | null
  >({
    queryKey,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: options.enabled ?? true,
    queryFn: async ({ pageParam }) => {
      const variables = queryBuilder.buildVariables({
        ...options,
        cursor: pageParam ?? undefined,
      })

      const collectionItems = await service.fetchCollectionItems(variables)

      return {
        nextCursor: collectionItems.nextPageCursor,
        rows: formatter.formatItems(collectionItems.items),
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

// ===== SEARCH COLLECTION HOOK (Single Responsibility) =====
export const useSearchCollectionItems = (options: SearchCollectionOptions) => {
  const service = CollectionServiceFactory.create()
  const queryBuilder = CollectionQueryBuilderFactory.create()
  const formatter = CollectionFormatterFactory.create()

  const trimmedTerm = options.searchTerm.trim()

  const queryKey = [
    ...COLLECTION_ITEMS_QUERY_KEY,
    'search',
    {
      searchTerm: trimmedTerm,
      limit: options.limit,
      sortBy: options.sortBy,
      sortDirection: options.sortDirection,
      collectionSlug: options.collectionSlug,
      address: options.address ?? null,
    },
  ] as const

  const query = useQuery({
    queryKey,
    enabled: Boolean((options.enabled ?? true) && trimmedTerm.length > 0),
    queryFn: async () => {
      const variables = queryBuilder.buildVariables({
        sortBy: options.sortBy ?? 'CREATED_DATE',
        sortDirection: options.sortDirection ?? 'ASC',
        limit: options.limit,
        filter: { query: trimmedTerm },
        collectionSlug: options.collectionSlug,
        address: options.address,
      })

      const collectionItems = await service.fetchCollectionItems(variables)
      return formatter.formatItems(collectionItems.items)
    },
  })

  return {
    ...query,
    rows: query.data ?? [],
  }
}
