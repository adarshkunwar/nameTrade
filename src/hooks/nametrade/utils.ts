import { getAddress } from 'viem'
import type { Address } from 'viem'
import type { NameTradeAuction, NameTradeListing, NameTradeOffer, NameTradeOfferType } from './types'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as Address

export const normalizeAddress = (value: string | Address): Address => {
  return getAddress(value as Address)
}

export const normalizeOptionalAddress = (value: string | Address | null | undefined): Address | null => {
  if (!value) {
    return null
  }

  try {
    return normalizeAddress(value)
  } catch {
    return null
  }
}

export const toBigInt = (value: bigint | number | string): bigint => {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number') return BigInt(value)
  return BigInt(value)
}

export const mapListing = (raw: any): NameTradeListing | null => {
  if (!raw) {
    return null
  }

  const nft = raw.nft ?? raw.nftAddr
  const tokenId = raw.tokenId ?? raw.tokenIdNum
  const allowedBuyers: (string | Address)[] = raw.allowedBuyers ?? []

  return {
    nft: normalizeAddress(nft),
    tokenId: toBigInt(tokenId),
    seller: normalizeAddress(raw.seller),
    price: toBigInt(raw.price),
    allowedBuyers: allowedBuyers.map((buyer) => normalizeAddress(buyer)),
  }
}

export const mapOffer = (raw: any): NameTradeOffer | null => {
  if (!raw) {
    return null
  }

  const nft = raw.nft ?? raw.nftAddr
  const tokenId = raw.tokenId ?? raw.tokenIdNum
  const offerer = raw.offerer ?? raw.offererAddr

  const offerNfts: (string | Address)[] = raw.offerNfts ?? []
  const offerTokenIds: (bigint | number | string)[] = raw.offerTokenIds ?? []

  return {
    nft: normalizeAddress(nft),
    tokenId: toBigInt(tokenId),
    offerer: normalizeAddress(offerer),
    amount: toBigInt(raw.amount ?? 0),
    expiry: toBigInt(raw.expiry ?? 0),
    offerType: Number(raw.offerType ?? 0) as NameTradeOfferType,
    offerNfts: offerNfts.map((addr) => normalizeAddress(addr)),
    offerTokenIds: offerTokenIds.map((id) => toBigInt(id)),
  }
}

export const mapAuction = (raw: any): NameTradeAuction | null => {
  if (!raw) {
    return null
  }

  const nft = raw.nft ?? raw.nftAddr
  const tokenId = raw.tokenId ?? raw.tokenIdNum

  return {
    nft: normalizeAddress(nft),
    tokenId: toBigInt(tokenId),
    seller: normalizeAddress(raw.seller),
    reservePrice: toBigInt(raw.reservePrice ?? 0),
    endTime: toBigInt(raw.endTime ?? 0),
    highestBidder: normalizeAddress(raw.highestBidder ?? ZERO_ADDRESS),
    highestBid: toBigInt(raw.highestBid ?? 0),
    settled: Boolean(raw.settled),
  }
}
