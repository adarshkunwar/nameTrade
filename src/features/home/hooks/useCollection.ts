import { useQuery, useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'
import type { CollectionItemsListVariables } from '../types/query'
import type { TUsername } from '../types/username'
import { collectionService } from '../services/CollectionService'
import { collectionQueryBuilder } from '../builders/CollectionQueryBuilder'
import { collectionFormatter } from '../formatters/CollectionFormatter'

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
  return useQuery({
    queryKey: ['collectionItems', variables.cursor],
    queryFn: async () => await collectionService.fetchCollectionItems(variables),
    enabled: Boolean(variables.cursor),
  })
}

// ===== INFINITE COLLECTION HOOK (Single Responsibility) =====
export const useCollectionItems = (options: CollectionOptions) => {
  const queryKey = collectionQueryBuilder.buildQueryKey(options)

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
      const variables = collectionQueryBuilder.buildVariables({
        ...options,
        cursor: pageParam ?? undefined,
      })

      const collectionItems = await collectionService.fetchCollectionItems(variables)

      return {
        nextCursor: collectionItems.nextPageCursor,
        rows: collectionFormatter.formatItems(collectionItems.items),
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
  const trimmedTerm = options.searchTerm.trim()
  const debouncedTerm = (() => {
    // simple synchronous debounce replacement using length gating within react-query
    // callers should avoid extra debounce; Search component calls onChange directly
    return trimmedTerm
  })()

  const queryKey = [
    ...COLLECTION_ITEMS_QUERY_KEY,
    'search',
    {
      searchTerm: debouncedTerm,
      limit: options.limit,
      sortBy: options.sortBy,
      sortDirection: options.sortDirection,
      collectionSlug: options.collectionSlug,
      address: options.address ?? null,
    },
  ] as const

  const query = useQuery({
    queryKey,
    enabled: Boolean((options.enabled ?? true) && debouncedTerm.length > 0),
    queryFn: async () => {
      const variables = collectionQueryBuilder.buildVariables({
        sortBy: options.sortBy ?? 'CREATED_DATE',
        sortDirection: options.sortDirection ?? 'ASC',
        limit: options.limit,
        filter: { query: debouncedTerm },
        collectionSlug: options.collectionSlug,
        address: options.address,
      })

      const collectionItems = await collectionService.fetchCollectionItems(variables)
      return collectionFormatter.formatItems(collectionItems.items)
    },
  })

  return {
    ...query,
    rows: query.data ?? [],
    errorMessage: query.error instanceof Error ? query.error.message : query.error ? 'Unknown error' : null,
  }
}
