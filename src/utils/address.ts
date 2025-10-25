import { getAddress } from 'viem'
import type { Address } from 'viem'
import type { NameTradeAuction, NameTradeListing, NameTradeOffer, NameTradeOfferType } from '@/types/trade'

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
    return null;
  }

  // Handle both array (tuple) and object (struct) formats
  const isArray = Array.isArray(raw);
  const nft = isArray ? raw[0] : raw.nft ?? raw.nftAddr;
  const tokenId = isArray ? raw[1] : raw.tokenId ?? raw.tokenIdNum;
  const seller = isArray ? raw[2] : raw.seller;
  const price = isArray ? raw[3] : raw.price;
  const allowedBuyers: (string | Address)[] = (isArray ? raw[4] : raw.allowedBuyers) ?? [];

  if (!nft || tokenId === undefined || tokenId === null || !seller || price === undefined || price === null) {
    return null;
  }

  try {
    return {
      nft: normalizeAddress(nft),
      tokenId: toBigInt(tokenId),
      seller: normalizeAddress(seller),
      price: toBigInt(price),
      allowedBuyers: allowedBuyers.map((buyer) => normalizeAddress(buyer)),
      offers: [], // Default empty offers
    };
  } catch (error) {
    console.error('Failed to map listing:', { raw, error });
    return null;
  }
};


export const mapOffer = (raw: any): NameTradeOffer | null => {
  if (!raw) {
    return null
  }

  try {
    const isArray = Array.isArray(raw)
    const nft = isArray ? raw[0] : raw.nft ?? raw.nftAddr
    const tokenId = isArray ? raw[1] : raw.tokenId ?? raw.tokenIdNum
    const offerer = isArray ? raw[2] : raw.offerer ?? raw.offererAddr
    const amount = isArray ? raw[3] : raw.amount
    const expiry = isArray ? raw[4] : raw.expiry
    const offerType = isArray ? raw[5] : raw.offerType
    const offerNfts: (string | Address)[] = (isArray ? raw[6] : raw.offerNfts) ?? []
    const offerTokenIds: (bigint | number | string)[] = (isArray ? raw[7] : raw.offerTokenIds) ?? []

    if (!nft || tokenId === undefined || !offerer) {
      return null
    }

    const normalizedOfferer = normalizeAddress(offerer)
    const normalizedNft = normalizeAddress(nft)
    const normalizedAmount = toBigInt(amount ?? 0)

    // If the offer is effectively empty/canceled, drop it
    if (normalizedAmount === 0n || normalizedOfferer === ZERO_ADDRESS) {
      return null
    }

    return {
      nft: normalizedNft,
      tokenId: toBigInt(tokenId),
      offerer: normalizedOfferer,
      amount: normalizedAmount,
      expiry: toBigInt(expiry ?? 0),
      offerType: Number(offerType ?? 0) as NameTradeOfferType,
      offerNfts: offerNfts.map((addr) => normalizeAddress(addr)),
      offerTokenIds: offerTokenIds.map((id) => toBigInt(id)),
    }
  } catch (error) {
    console.error('Failed to map offer:', { raw, error })
    return null
  }
}

export const mapAuction = (raw: any): NameTradeAuction | null => {
  if (!raw) {
    return null;
  }

  const isArray = Array.isArray(raw);
  const nft = isArray ? raw[0] : raw.nft ?? raw.nftAddr;
  const tokenId = isArray ? raw[1] : raw.tokenId ?? raw.tokenIdNum;
  const seller = isArray ? raw[2] : raw.seller;
  const reservePrice = isArray ? raw[3] : raw.reservePrice;
  const endTime = isArray ? raw[4] : raw.endTime;
  const highestBidder = isArray ? raw[5] : raw.highestBidder;
  const highestBid = isArray ? raw[6] : raw.highestBid;
  const settled = isArray ? raw[7] : raw.settled;

  if (!nft || tokenId === undefined || !seller || reservePrice === undefined || endTime === undefined) {
    return null;
  }

  try {
    return {
      nft: normalizeAddress(nft),
      tokenId: toBigInt(tokenId),
      seller: normalizeAddress(seller),
      reservePrice: toBigInt(reservePrice),
      endTime: toBigInt(endTime),
      highestBidder: normalizeAddress(highestBidder ?? ZERO_ADDRESS),
      highestBid: toBigInt(highestBid ?? 0),
      settled: Boolean(settled),
    };
  } catch (error) {
    console.error('Failed to map auction:', { raw, error });
    return null;
  }
};
