import type { ProfileItem, ProfileItemOwnershipField } from '../types/query'
import type { TProfileUsername } from '../types/profile'

const normalizeOwnership = (ownership: ProfileItemOwnershipField) => {
  if (!ownership) return []
  if (Array.isArray(ownership)) {
    return ownership.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
  }
  return [ownership].filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
}

export const formatProfileItem = (item: ProfileItem): TProfileUsername | null => {
  const ownershipEntry = normalizeOwnership(item.ownership).find((entry) => !entry.isHidden)

  if (!ownershipEntry || ownershipEntry.isHidden) {
    return null
  }

  const quantityValue = ownershipEntry.quantity ?? '0'
  const quantity = Number(quantityValue)

  const username = item.name?.trim() || `#${item.tokenId}`
  const collectionSlug = item.collection?.slug ?? 'unknown'
  const collectionName = item.collection?.name?.trim() || collectionSlug

  return {
    id: item.id,
    username,
    tokenId: item.tokenId,
    contractAddress: item.contractAddress,
    collectionSlug,
    collectionName,
    lastTransferAt: item.lastTransferAt,
    quantity: Number.isFinite(quantity) ? quantity : 0,
  }
}

export default formatProfileItem
