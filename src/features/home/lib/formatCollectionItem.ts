import type { CollectionItemsListResponse } from '../types/query'
import type { TUsername } from '../types/username'

export const formatCollectionItem = (
  item: CollectionItemsListResponse['collectionItems']['items'][number]
): TUsername => {
  const username = item.name?.trim() || `#${item.tokenId}`
  const marketplace = item.bestListing?.marketplace?.identifier ?? '—'
  const listingCurrency = item.bestListing?.pricePerItem?.token?.unit ?? '—'
  const bestOfferUsd =
    typeof item.bestOffer?.pricePerItem?.usd === 'number'
      ? `$${item.bestOffer.pricePerItem.usd.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}`
      : '—'
  const rarityRank = typeof item.rarity?.rank === 'number' ? `#${item.rarity.rank.toLocaleString()}` : '—'
  const ownerAddress = item.owner?.address ?? '—'
  const createdAt = item.createdAt ?? null

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
    createdAt,
  }
}

export default formatCollectionItem
