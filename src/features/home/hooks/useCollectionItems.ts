import { useInfiniteQuery, useQuery, type InfiniteData } from '@tanstack/react-query'
import {
  fetchCollectionItems,
  type CollectionItem,
  type CollectionItemsListVariables,
} from '../api/collectionItems'

export interface UsernameRow {
  id: string
  username: string
  tokenId: string
  contractAddress: string
  marketplace: string
  listingCurrency: string
  bestOfferUsd: string
  rarityRank: string
  ownerAddress: string
}

export const formatCollectionItem = (item: CollectionItem): UsernameRow => {
  const username = item.name?.trim() || `#${item.tokenId}`
  const marketplace = item.bestListing?.marketplace?.identifier ?? '—'
  const listingCurrency = item.bestListing?.pricePerItem?.token?.unit ?? '—'
  const bestOfferUsd =
    typeof item.bestOffer?.pricePerItem?.usd === 'number'
      ? `$${item.bestOffer.pricePerItem.usd.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}`
      : '—'
  const rarityRank =
    typeof item.rarity?.rank === 'number' ? `#${item.rarity.rank.toLocaleString()}` : '—'
  const ownerAddress = item.owner?.address ?? '—'

  return {
    id: item.id,
    username,
    tokenId: item.tokenId,
    contractAddress: item.contractAddress,
    marketplace,
    listingCurrency,
    bestOfferUsd,
    rarityRank,
    ownerAddress,
  }
}

export type CollectionItemsSortBy = CollectionItemsListVariables['sort']['by']
export type CollectionItemsSortDirection = CollectionItemsListVariables['sort']['direction']

export const COLLECTION_ITEMS_QUERY_KEY = ['collectionItems', 'basenames'] as const

const defaultVariables: CollectionItemsListVariables = {
  collectionSlug: 'basenames',
  limit: 50,
  sort: {
    by: 'PRICE',
    direction: 'ASC',
  },
}

export interface UseCollectionItemsOptions {
  sortBy: CollectionItemsSortBy
  sortDirection: CollectionItemsSortDirection
  limit?: number
  filter?: CollectionItemsListVariables['filter']
  collectionSlug?: string
  address?: string | null
  enabled?: boolean
}

const resolveVariables = ({
  sortBy,
  sortDirection,
  limit,
  filter,
  collectionSlug,
  address,
}: UseCollectionItemsOptions): CollectionItemsListVariables => ({
  collectionSlug: collectionSlug ?? defaultVariables.collectionSlug,
  limit: limit ?? defaultVariables.limit,
  sort: {
    by: sortBy,
    direction: sortDirection,
  },
  filter: filter ?? null,
  address: address ?? null,
})

export const useCollectionItems = ({
  sortBy,
  sortDirection,
  limit,
  filter,
  collectionSlug,
  address,
  enabled = true,
}: UseCollectionItemsOptions) => {
  const queryKey = [
    ...COLLECTION_ITEMS_QUERY_KEY,
    {
      sortBy,
      sortDirection,
      limit,
      filter: filter ?? null,
      collectionSlug,
      address: address ?? null,
    },
  ] as const

  type CollectionItemsPage = {
    nextCursor: string | null
    rows: UsernameRow[]
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
    enabled,
    queryFn: async ({ pageParam }) => {
      const variables = resolveVariables({
        sortBy,
        sortDirection,
        limit,
        filter,
        collectionSlug,
        address,
      })

      const collectionItems = await fetchCollectionItems({
        ...variables,
        cursor: pageParam ?? undefined,
      })

      return {
        nextCursor: collectionItems.nextPageCursor,
        rows: collectionItems.items.map(formatCollectionItem),
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

export interface UseSearchCollectionItemsOptions {
  searchTerm: string
  limit?: number
  sortBy?: CollectionItemsSortBy
  sortDirection?: CollectionItemsSortDirection
  collectionSlug?: string
  address?: string | null
  enabled?: boolean
}

export const useSearchCollectionItems = ({
  searchTerm,
  limit = 10,
  sortBy = 'CREATED_DATE',
  sortDirection = 'ASC',
  collectionSlug,
  address,
  enabled = true,
}: UseSearchCollectionItemsOptions) => {
  const trimmedTerm = searchTerm.trim()

  const queryKey = [
    ...COLLECTION_ITEMS_QUERY_KEY,
    'search',
    {
      searchTerm: trimmedTerm,
      limit,
      sortBy,
      sortDirection,
      collectionSlug,
      address: address ?? null,
    },
  ] as const

  const query = useQuery({
    queryKey,
    enabled: Boolean(enabled && trimmedTerm.length > 0),
    queryFn: async () => {
      const collectionItems = await fetchCollectionItems({
        collectionSlug: collectionSlug ?? defaultVariables.collectionSlug,
        limit,
        sort: {
          by: sortBy,
          direction: sortDirection,
        },
        filter: {
          query: trimmedTerm,
        },
        address: address ?? null,
      })

      return collectionItems.items.map(formatCollectionItem)
    },
  })

  return {
    ...query,
    rows: query.data ?? [],
  }
}
