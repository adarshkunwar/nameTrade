export const PROFILE_ITEMS_ENDPOINT =
  import.meta.env.VITE_COLLECTION_ITEMS_ENDPOINT || 'https://gql.opensea.io/graphql'

export const PROFILE_ITEMS_LIST_QUERY = `
  query ProfileItemsListQuery(
    $address: Address!
    $limit: Int
    $cursor: String
    $sort: ProfileItemsSort!
    $filter: ProfileItemsFilter
  ) {
    profileItems(addresses: [$address], limit: $limit, sort: $sort, filter: $filter, cursor: $cursor) {
      nextPageCursor
      items {
        version
        id
        collection {
          id
          slug
          __typename
        }
        enforcement {
          isDelisted
          __typename
        }
        isFungible
        tokenId
        contractAddress
        ...ItemOwnedQuantity
        lastTransferAt
        ownership(address: $address) {
          id
          isHidden
          __typename
        }
        chain {
          identifier
          __typename
        }
        bestListing {
          startTime
          maker {
            address
            __typename
          }
          __typename
        }
        bestOffer {
          pricePerItem {
            usd
            __typename
          }
          __typename
        }
        lowestListingForOwner(address: $address) {
          pricePerItem {
            usd
            __typename
          }
          __typename
        }
        ...ProfileItemsTableRowFragment
        ...ProfileItemsCardFragment
        ...profileItemsSelection
        ...ProfileItemPaginator
        __typename
      }
      __typename
    }
  }

  fragment ProfileItemsTableRowFragment on Item {
    id
    chain {
      ...ChainBadge
      __typename
    }
    isFungible
    name
    lastTransferAt
    ownership(address: $address) {
      id
      __typename
    }
    rarity {
      rank
      category
      __typename
    }
    collection {
      floorPrice {
        pricePerItem {
          ...TokenPrice
          __typename
        }
        __typename
      }
      name
      isVerified
      ...CollectionLink
      ...CollectionPreviewTooltip
      __typename
    }
    enforcement {
      isCompromised
      __typename
    }
    lowestListingForOwner(address: $address) {
      pricePerItem {
        ...TokenPrice
        __typename
      }
      __typename
    }
    lastSale {
      ...TokenPrice
      __typename
    }
    standard
    ...SellItemTableButton
    ...ItemLink
    ...ItemAvatar
    ...profileItemsSelection
    ...EnforcementBadge
    ...OwnedQuantity
    ...RarityTooltip
    ...ItemPreviewTooltip
    ...BulkActionsDisabledTooltip
    __typename
  }

  fragment ChainBadge on Chain {
    identifier
    name
    __typename
  }

  fragment ItemLink on BaseItem {
    ...itemUrl
    chain {
      identifier
      __typename
    }
    tokenId
    contractAddress
    imageUrl
    animationUrl
    ...useSetItemQuickView
    __typename
  }

  fragment itemUrl on ItemIdentifier {
    chain {
      identifier
      arch
      __typename
    }
    tokenId
    contractAddress
    __typename
  }

  fragment useSetItemQuickView on Item {
    ...itemUrl
    ...ItemViewModal
    __typename
  }

  fragment ItemViewModal on Item {
    tokenId
    imageUrl
    id
    name
    description
    collection {
      slug
      __typename
    }
    ...itemIdentifier
    ...ItemViewSkeleton
    ...itemUrl
    ...ItemEditProvider
    ...ItemPageMedia
    ...ItemTitle
    ...ItemTitleWithEditButton
    __typename
  }

  fragment itemIdentifier on ItemIdentifier {
    chain {
      identifier
      __typename
    }
    tokenId
    contractAddress
    __typename
  }

  fragment ItemViewSkeleton on Item {
    name
    ...ItemPageMedia
    ...ItemAbout
    __typename
  }

  fragment ItemPageMedia on Item {
    id
    ...ItemMedia
    imageUrl
    __typename
  }

  fragment ItemMedia on Item {
    imageUrl
    animationUrl
    backgroundColor
    collection {
      imageUrl
      __typename
    }
    __typename
  }

  fragment ItemAbout on Item {
    id
    name
    tokenId
    tokenUri
    contractAddress
    chain {
      name
      identifier
      arch
      __typename
    }
    standard
    isCreatorTokenRestrictedContract
    description
    details {
      name
      value
      __typename
    }
    collection {
      ...CollectionOwner
      name
      description
      owner {
        displayName
        ...AccountLockup
        __typename
      }
      __typename
    }
    __typename
  }

  fragment CollectionOwner on Collection {
    owner {
      displayName
      isVerified
      address
      ...profileUrl
      ...ProfilePreviewTooltip
      __typename
    }
    standard
    __typename
  }

  fragment profileUrl on ProfileIdentifier {
    displayName
    address
    __typename
  }

  fragment ProfilePreviewTooltip on ProfileIdentifier {
    address
    ...ProfilePreviewTooltipContent
    __typename
  }

  fragment ProfilePreviewTooltipContent on ProfileIdentifier {
    address
    __typename
  }

  fragment AccountLockup on ProfileIdentifier {
    address
    displayName
    imageUrl
    ...profileUrl
    __typename
  }

  fragment ItemEditProvider on Item {
    id
    tokenId
    name
    description
    imageUrl
    collection {
      slug
      __typename
    }
    attributes {
      traitType
      value
      __typename
    }
    __typename
  }

  fragment ItemTitle on Item {
    name
    ...EnforcementBadge
    __typename
  }

  fragment EnforcementBadge on EnforcedEntity {
    __typename
    enforcement {
      isCompromised
      isDisabled
      isOwnershipDisputed
      __typename
    }
  }

  fragment ItemTitleWithEditButton on Item {
    ...ItemTitle
    __typename
  }

  fragment TokenPrice on Price {
    usd
    token {
      unit
      symbol
      contractAddress
      chain {
        identifier
        __typename
      }
      __typename
    }
    __typename
  }

  fragment profileItemsSelection on Item {
    id
    imageUrl
    chain {
      identifier
      __typename
    }
    contractAddress
    tokenId
    bestOffer {
      __typename
    }
    bestListing {
      maker {
        address
        __typename
      }
      __typename
    }
    collection {
      slug
      __typename
    }
    lowestListingForOwner(address: $address) {
      __typename
    }
    isFungible
    ...useTransferItems
    ...useAcceptOffers
    ...useListItems
    ...useCancelItemsListings
    ...isItemTradable
    ...HideButton
    __typename
  }

  fragment useTransferItems on Item {
    tokenId
    chain {
      identifier
      arch
      __typename
    }
    contractAddress
    ...ItemOwnedQuantity
    ...isItemTradable
    ...isCreatorTokenRestrictedContract
    __typename
  }

  fragment ItemOwnedQuantity on Item {
    ownership(address: $address) {
      id
      quantity
      __typename
    }
    __typename
  }

  fragment isItemTradable on Item {
    collection {
      isTradingDisabled
      __typename
    }
    enforcement {
      isCompromised
      isDisabled
      __typename
    }
    isTransferLocked
    __typename
  }

  fragment isCreatorTokenRestrictedContract on Item {
    isCreatorTokenRestrictedContract
    __typename
  }

  fragment useAcceptOffers on Item {
    chain {
      identifier
      arch
      __typename
    }
    contractAddress
    tokenId
    bestOffer {
      pricePerItem {
        token {
          unit
          address
          __typename
        }
        __typename
      }
      maker {
        address
        __typename
      }
      __typename
    }
    enforcement {
      isCompromised
      __typename
    }
    ...isItemTradable
    __typename
  }

  fragment useListItems on Item {
    tokenId
    chain {
      identifier
      arch
      __typename
    }
    contractAddress
    ...ItemOwnedQuantity
    ...isItemTradable
    __typename
  }

  fragment useCancelItemsListings on Item {
    chain {
      arch
      identifier
      __typename
    }
    contractAddress
    tokenId
    lowestListingForOwner(address: $address) {
      __typename
    }
    __typename
  }

  fragment HideButton on Item {
    ownership(address: $address) {
      id
      isHidden
      __typename
    }
    __typename
  }

  fragment ItemAvatar on Item {
    imageUrl
    tokenId
    backgroundColor
    collection {
      imageUrl
      __typename
    }
    __typename
  }

  fragment OwnedQuantity on Item {
    ...ItemOwnedQuantity
    __typename
  }

  fragment RarityTooltip on Item {
    rarity {
      category
      rank
      totalSupply
      __typename
    }
    __typename
  }

  fragment CollectionLink on CollectionIdentifier {
    slug
    ... on Collection {
      ...getDropStatus
      __typename
    }
    __typename
  }

  fragment getDropStatus on Collection {
    drop {
      __typename
      ... on Erc721SeaDropV1 {
        maxSupply
        totalSupply
        __typename
      }
      ... on Erc1155SeaDropV2 {
        tokenSupply {
          totalSupply
          maxSupply
          __typename
        }
        __typename
      }
      stages {
        startTime
        endTime
        __typename
      }
    }
    __typename
  }

  fragment SellItemTableButton on Item {
    ...bestItemOffer
    ...useAcceptOffers
    __typename
  }

  fragment bestItemOffer on Item {
    bestItemOffer {
      pricePerItem {
        native {
          unit
          __typename
        }
        ...TokenPrice
        __typename
      }
      maker {
        address
        __typename
      }
      __typename
    }
    collection {
      id
      topOffer {
        pricePerItem {
          native {
            unit
            __typename
          }
          ...TokenPrice
          __typename
        }
        maker {
          address
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }

  fragment ItemPreviewTooltip on ItemIdentifier {
    ...ItemPreviewTooltipContent
    __typename
  }

  fragment ItemPreviewTooltipContent on ItemIdentifier {
    ...itemIdentifier
    __typename
  }

  fragment CollectionPreviewTooltip on CollectionIdentifier {
    ...CollectionPreviewTooltipContent
    __typename
  }

  fragment CollectionPreviewTooltipContent on CollectionIdentifier {
    slug
    __typename
  }

  fragment BulkActionsDisabledTooltip on Item {
    collection {
      slug
      __typename
    }
    __typename
  }

  fragment ProfileItemsCardFragment on Item {
    id
    isFungible
    chain {
      identifier
      __typename
    }
    contractAddress
    tokenId
    ...bestItemOffer
    lowestListingForOwner(address: $address) {
      id
      pricePerItem {
        ...TokenPrice
        __typename
      }
      maker {
        address
        __typename
      }
      marketplace {
        identifier
        __typename
      }
      ...useCancelOrders
      __typename
    }
    owner {
      address
      __typename
    }
    enforcement {
      isDisabled
      isCompromised
      __typename
    }
    collection {
      name
      slug
      isVerified
      ...CollectionLink
      ...CollectionPreviewTooltip
      __typename
    }
    ...useBuyItems
    ...useMakeOffer
    ...useListItems
    ...profileItemsSelection
    ...useAcceptOffers
    ...QuantityBadge
    ...ItemCardMedia
    ...ItemCardNameFragment
    ...RarityBadgeFragment
    ...ItemLink
    ...OwnedQuantity
    ...EnforcementBadge
    ...useCancelItemsListings
    ...ItemOwnedQuantity
    ...isItemTradable
    __typename
  }

  fragment ItemCardMedia on Item {
    id
    tokenId
    ...ItemMedia
    __typename
  }

  fragment ItemCardNameFragment on Item {
    name
    __typename
  }

  fragment RarityBadgeFragment on Item {
    rarity {
      rank
      category
      __typename
    }
    ...RarityTooltip
    __typename
  }

  fragment useBuyItems on Item {
    chain {
      identifier
      arch
      __typename
    }
    contractAddress
    tokenId
    collection {
      slug
      __typename
    }
    bestListing {
      pricePerItem {
        token {
          unit
          address
          symbol
          ...currencyIdentifier
          __typename
        }
        __typename
      }
      maker {
        address
        __typename
      }
      __typename
    }
    ...isItemListed
    ...isItemTradable
    __typename
  }

  fragment isItemListed on Item {
    bestListing {
      __typename
    }
    __typename
  }

  fragment currencyIdentifier on ContractIdentifier {
    contractAddress
    chain {
      identifier
      __typename
    }
    __typename
  }

  fragment useMakeOffer on Item {
    tokenId
    chain {
      identifier
      arch
      __typename
    }
    contractAddress
    ...isItemTradable
    __typename
  }

  fragment QuantityBadge on Item {
    bestListing {
      quantityRemaining
      __typename
    }
    totalSupply
    __typename
  }

  fragment useCancelOrders on BaseOrder {
    id
    marketplace {
      identifier
      __typename
    }
    maker {
      address
      __typename
    }
    __typename
  }

  fragment ProfileItemPaginator on Item {
    id
    createdAt
    rarity {
      rank
      __typename
    }
    collection {
      floorPrice {
        pricePerItem {
          usd
          __typename
        }
        __typename
      }
      topOffer {
        pricePerItem {
          usd
          __typename
        }
        __typename
      }
      __typename
    }
    bestListing {
      startTime
      pricePerItem {
        usd
        __typename
      }
      __typename
    }
    bestOffer {
      pricePerItem {
        usd
        __typename
      }
      __typename
    }
    lastSaleAt
    lastSale {
      usd
      __typename
    }
    lastTransferAt
    ownership(address: $address) {
      id
      __typename
    }
    lowestListingForOwner(address: $address) {
      pricePerItem {
        usd
        __typename
      }
      __typename
    }
    __typename
  }
`
