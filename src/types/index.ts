export interface NftIdentifier {
  nft: `0x${string}`;
  tokenId: bigint;
}

export interface Auction {
  nftAddr: `0x${string}`;
  tokenIdNum: bigint;
  seller: `0x${string}`;
  reservePrice: bigint;
  endTime: bigint;
  highestBidder: `0x${string}`;
  highestBid: bigint;
  settled: boolean;
}
