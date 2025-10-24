import type { Address, Hash, TransactionReceipt } from 'viem'

export enum NameTradeOfferType {
  Native = 0,
  NFT = 1,
}

export interface NameTradeListing {
  nft: Address;
  tokenId: bigint;
  seller: Address;
  price: bigint;
  allowedBuyers: Address[];
  offers: NameTradeOffer[];
  name?: string | null;
}

export interface NameTradeOffer {
  nft: Address
  tokenId: bigint
  offerer: Address
  amount: bigint
  expiry: bigint
  offerType: NameTradeOfferType
  offerNfts: Address[]
  offerTokenIds: bigint[]
}

export interface NameTradeAuction {
  nft: Address
  tokenId: bigint
  seller: Address
  reservePrice: bigint
  endTime: bigint
  highestBidder: Address
  highestBid: bigint
  settled: boolean
}

export type NameTradeApprovalStatus = boolean
export type NameTradeCounterPrice = bigint

export interface NameTradeWriteResult {
  hash: Hash
  waitForReceipt: () => Promise<TransactionReceipt>
}

export interface NameTradeWriteOptions {
  /**
   * Determines whether the hook should automatically invalidate cached reads.
   * Hooks may still expose manual invalidate helpers regardless of this flag.
   */
  invalidateOnSuccess?: boolean
}
