// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {EnumerableStorage, NftIdentifier} from "./EnumerableStorage.sol";

contract NameTrade is ReentrancyGuard, Ownable, IERC721Receiver {
    using Address for address payable;

    // --- Offer Types ---
    enum OfferType {
        Native,
        NFT
    }

    // --- Structs ---
    struct Listing {
        address nft;
        uint256 tokenId;
        address seller;
        uint256 price;
        address[] allowedBuyers; // Empty array means anyone can buy
    }

    struct Offer {
        address nft;
        uint256 tokenId;
        address offerer;
        uint256 amount;
        uint256 expiry;
        OfferType offerType;
        address[] offerNfts;
        uint256[] offerTokenIds;
    }

    struct Auction {
        address nft;
        uint256 tokenId;
        address seller;
        uint256 reservePrice;
        uint256 endTime;
        address highestBidder;
        uint256 highestBid;
        bool settled;
    }


    // --- State ---
    mapping(address => mapping(uint256 => Listing)) public listings;
    mapping(address => mapping(uint256 => mapping(address => Offer))) public offers;
    mapping(address => mapping(uint256 => Auction)) public auctions;
    mapping(address => mapping(uint256 => mapping(address => bool))) public approvalStatus;
    mapping(address => mapping(uint256 => mapping(address => uint256))) public counterPrice;

    // --- Trackers for Getters ---
    using EnumerableStorage for EnumerableStorage.NftSet;
    using EnumerableStorage for EnumerableStorage.OffererSet;

    EnumerableStorage.NftSet private _listedNfts;
    EnumerableStorage.NftSet private _activeAuctions;
    mapping(address => mapping(uint256 => EnumerableStorage.OffererSet)) private _offererSets;

    // --- Immutables ---
    uint256 public immutable PLATFORM_FEE_BPS;
    address public immutable PLATFORM_FEE_RECIPIENT;

    // --- Constants ---
    uint256 public constant MIN_BID_INCREMENT_BPS = 11000; // 110%
    uint256 public constant ABSOLUTE_MIN_BID = 0.1 ether;
    uint256 public constant AUCTION_TIME_EXTENSION = 5 minutes;
    uint256 public constant AUCTION_EXTENSION_THRESHOLD = 5 minutes;
    uint256 public constant OFFER_EXPIRY_TIME = 24 hours;

    // --- Events ---
    event Listed(address indexed nft, uint256 indexed tokenId, address indexed seller, uint256 price);
    event Sale(address indexed nft, uint256 indexed tokenId, address indexed buyer, uint256 price);
    event NativeOfferMade(address indexed nft, uint256 indexed tokenId, address indexed offerer, uint256 amount);
    event NFTOfferMade(
        address indexed nft,
        uint256 indexed tokenId,
        address indexed offerer,
        address[] offerNfts,
        uint256[] offerTokenIds
    );
    event OfferUpdated(
        address indexed nft, uint256 indexed tokenId, address indexed offerer, uint256 newAmount, OfferType offerType
    );
    event OfferAccepted(
        address indexed nft,
        uint256 indexed tokenId,
        address indexed seller,
        address offerer,
        uint256 amount,
        OfferType offerType
    );
    event NFTForNFTOfferAccepted(
        address indexed nft,
        uint256 indexed tokenId,
        address indexed seller,
        address offerer,
        address[] offerNfts,
        uint256[] offerTokenIds
    );
    event AuctionStarted(
        address indexed nft, uint256 indexed tokenId, address indexed seller, uint256 reservePrice, uint256 endTime
    );
    event BidPlaced(address indexed nft, uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event AuctionEnded(address indexed nft, uint256 indexed tokenId, address indexed winner, uint256 amount);
    event AuctionExtended(address indexed nft, uint256 indexed tokenId, uint256 newEndTime);
    event AuctionBidsRefunded(address indexed nft, uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event ListingCancelled(address indexed nft, uint256 indexed tokenId, address indexed seller);
    event BuyerWhitelistUpdated(address indexed nft, uint256 indexed tokenId, address[] buyers);
    event ApprovalRevoked(address indexed nft, uint256 indexed tokenId, address indexed owner);
    event PlatformFeePaid(address indexed payer, uint256 amount, address indexed recipient);
    event RoyaltyPaid(address indexed payer, uint256 amount, address indexed recipient);
    event OfferRemoved(address indexed nft, uint256 indexed tokenId, address indexed offerer, OfferType offerType);

    constructor(uint256 platformFeeBps, address platformFeeRecipient) Ownable(msg.sender) {
        require(platformFeeRecipient != address(0), "Invalid platform fee recipient");
        require(platformFeeBps <= 1000, "Platform fee too high");

        PLATFORM_FEE_BPS = platformFeeBps;
        PLATFORM_FEE_RECIPIENT = platformFeeRecipient;
    }

    // --- Modifiers ---
    modifier onlyTradableNFT(address nft) {
        require(_isTradableNFT(nft), "Not a tradable NFT");
        _;
    }

    modifier onlyNFTOwner(address nft, uint256 tokenId) {
        require(IERC721(nft).ownerOf(tokenId) == msg.sender, "Not NFT owner");
        _;
    }

    modifier onlyAllowedBuyer(address nft, uint256 tokenId) {
        Listing storage listing = listings[nft][tokenId];
        require(
            listing.allowedBuyers.length == 0 || _isAddressInArray(msg.sender, listing.allowedBuyers),
            "Not allowed buyer"
        );
        _;
    }

    // --- Listing ---
    function list(address nft, uint256 tokenId, uint256 price)
        external
        onlyTradableNFT(nft)
        onlyNFTOwner(nft, tokenId)
    {
        require(price > 0, "Price must be positive");
        require(
            IERC721(nft).getApproved(tokenId) == address(this)
                || IERC721(nft).isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );
        approvalStatus[nft][tokenId][msg.sender] = true;

        _listedNfts.add(nft, tokenId);

        listings[nft][tokenId] =
            Listing({nft: nft, tokenId: tokenId, seller: msg.sender, price: price, allowedBuyers: new address[](0)});
        emit Listed(nft, tokenId, msg.sender, price);
    }

    function listWithAllowedBuyers(address nft, uint256 tokenId, uint256 price, address[] calldata allowedBuyers)
        external
        onlyTradableNFT(nft)
        onlyNFTOwner(nft, tokenId)
    {
        require(price > 0, "Price must be positive");
        require(
            IERC721(nft).getApproved(tokenId) == address(this)
                || IERC721(nft).isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );
        approvalStatus[nft][tokenId][msg.sender] = true;

        _listedNfts.add(nft, tokenId);

        listings[nft][tokenId] =
            Listing({nft: nft, tokenId: tokenId, seller: msg.sender, price: price, allowedBuyers: allowedBuyers});
        emit Listed(nft, tokenId, msg.sender, price);
        emit BuyerWhitelistUpdated(nft, tokenId, allowedBuyers);
    }

    function updateAllowedBuyers(address nft, uint256 tokenId, address[] calldata allowedBuyers)
        external
        onlyTradableNFT(nft)
        onlyNFTOwner(nft, tokenId)
    {
        require(listings[nft][tokenId].seller == msg.sender, "Not the seller");
        listings[nft][tokenId].allowedBuyers = allowedBuyers;
        emit BuyerWhitelistUpdated(nft, tokenId, allowedBuyers);
    }

    function cancelListing(address nft, uint256 tokenId) external onlyTradableNFT(nft) onlyNFTOwner(nft, tokenId) {
        _listedNfts.remove(nft, tokenId);
        delete listings[nft][tokenId];
        emit ListingCancelled(nft, tokenId, msg.sender);
    }

    // --- Buy ---
    function buy(address nft, uint256 tokenId)
        external
        payable
        nonReentrant
        onlyTradableNFT(nft)
        onlyAllowedBuyer(nft, tokenId)
    {
        _buy(nft, tokenId);
    }

    // --- Offers ---
    function makeNativeOffer(address nft, uint256 tokenId) external payable nonReentrant onlyTradableNFT(nft) {
        require(msg.value > 0, "Offer must be positive");
        Offer storage existing = offers[nft][tokenId][msg.sender];
        require(existing.amount == 0, "Already offered");

        _offererSets[nft][tokenId].add(msg.sender);

        offers[nft][tokenId][msg.sender] = Offer({
            nft: nft,
            tokenId: tokenId,
            offerer: msg.sender,
            amount: msg.value,
            expiry: block.timestamp + OFFER_EXPIRY_TIME,
            offerType: OfferType.Native,
            offerNfts: new address[](0),
            offerTokenIds: new uint256[](0)
        });
        emit NativeOfferMade(nft, tokenId, msg.sender, msg.value);
    }

    function makeNFTOffer(address nft, uint256 tokenId, address[] calldata offerNfts, uint256[] calldata offerTokenIds)
        external
        nonReentrant
        onlyTradableNFT(nft)
    {
        require(offerNfts.length > 0, "Must offer at least one NFT");
        require(offerNfts.length == offerTokenIds.length, "Arrays length mismatch");
        require(offerNfts.length <= 10, "Too many NFTs in offer"); // Limit to prevent gas issues

        Offer storage existing = offers[nft][tokenId][msg.sender];
        require(existing.amount == 0, "Already offered");

        // Validate and transfer all offer NFTs
        for (uint256 i = 0; i < offerNfts.length; i++) {
            address offerNft = offerNfts[i];
            uint256 offerTokenId = offerTokenIds[i];

            require(_isTradableNFT(offerNft), "Invalid offer NFT");
            require(IERC721(offerNft).ownerOf(offerTokenId) == msg.sender, "Not offer NFT owner");
            require(
                IERC721(offerNft).getApproved(offerTokenId) == address(this)
                    || IERC721(offerNft).isApprovedForAll(msg.sender, address(this)),
                "Offer NFT not approved"
            );

            // Transfer NFT to marketplace escrow
            IERC721(offerNft).safeTransferFrom(msg.sender, address(this), offerTokenId);
        }

        _offererSets[nft][tokenId].add(msg.sender);

        offers[nft][tokenId][msg.sender] = Offer({
            nft: nft,
            tokenId: tokenId,
            offerer: msg.sender,
            amount: 0,
            expiry: block.timestamp + OFFER_EXPIRY_TIME,
            offerType: OfferType.NFT,
            offerNfts: offerNfts,
            offerTokenIds: offerTokenIds
        });

        emit NFTOfferMade(nft, tokenId, msg.sender, offerNfts, offerTokenIds);
    }

    function updateOffer(address nft, uint256 tokenId, address offerer, uint256 newAmount, OfferType offerType)
        external
        payable
        nonReentrant
        onlyTradableNFT(nft)
    {
        Offer storage offer = offers[nft][tokenId][offerer];
        require(offer.offerType == offerType, "Offer type mismatch");
        require(offer.expiry >= block.timestamp, "Offer not expired");

        /* ──────────────────────────────────────────────
       ❶  BUYER adjusts his own (native) offer
    ───────────────────────────────────────────────*/
        if (msg.sender == offerer) {
            require(offerType == OfferType.Native, "Only native");
            require(newAmount > 0, "Offer must be positive");
            uint256 oldAmount = offer.amount;
            offer.amount = newAmount;
            offer.expiry = block.timestamp + OFFER_EXPIRY_TIME;

            if (newAmount > oldAmount) {
                require(msg.value == newAmount - oldAmount, "Need extra ETH");
            } else if (newAmount < oldAmount) {
                payable(offerer).sendValue(oldAmount - newAmount);
            }

            emit OfferUpdated(nft, tokenId, offerer, newAmount, offerType);
            return;
        }

        /* ──────────────────────────────────────────────
       ❲  SELLER issues a counter‑offer
          – escrow is refunded to buyer
    ───────────────────────────────────────────────*/
        require(msg.sender == IERC721(nft).ownerOf(tokenId), "Not seller");
        require(offerType == OfferType.Native, "Only native");
        require(newAmount > 0, "Counter offer must be positive");

        if (offer.amount > 0) {
            uint256 refund = offer.amount;
            offer.amount = 0;
            payable(offerer).sendValue(refund);
        }

        counterPrice[nft][tokenId][offerer] = newAmount; // full price desired
        offer.expiry = block.timestamp + OFFER_EXPIRY_TIME;

        emit OfferUpdated(nft, tokenId, offerer, newAmount, offerType);
    }

    function removeOffer(address nft, uint256 tokenId, address offerer) external nonReentrant onlyTradableNFT(nft) {
        Offer storage offer = offers[nft][tokenId][offerer];
        uint256 counterAmount = counterPrice[nft][tokenId][offerer];

        // Check if there's an offer, NFT offer, counter offer, or any offer record exists
        require(
            offer.amount > 0 || offer.offerType == OfferType.NFT || counterAmount > 0 || offer.expiry > 0, "No offer"
        );

        address nftOwner = IERC721(nft).ownerOf(tokenId);
        // Allow anyone to remove expired offers, but only offerer or NFT owner for non-expired offers
        require(offer.expiry < block.timestamp || msg.sender == offerer || msg.sender == nftOwner, "Not authorized");

        if (offer.offerType == OfferType.NFT) {
            // Return all escrowed NFTs
            for (uint256 i = 0; i < offer.offerNfts.length; i++) {
                address offerNft = offer.offerNfts[i];
                uint256 offerTokenId = offer.offerTokenIds[i];

                require(IERC721(offerNft).ownerOf(offerTokenId) == address(this), "NFT not escrowed");
                IERC721(offerNft).safeTransferFrom(address(this), offerer, offerTokenId);
            }
            _offererSets[nft][tokenId].remove(offerer);
            delete offers[nft][tokenId][offerer];
            emit OfferRemoved(nft, tokenId, offerer, OfferType.NFT);
        } else {
            uint256 refund = offer.amount;
            _offererSets[nft][tokenId].remove(offerer);
            delete offers[nft][tokenId][offerer];
            // Clear counter offer if it exists
            if (counterAmount > 0) {
                delete counterPrice[nft][tokenId][offerer];
            }
            payable(offerer).sendValue(refund);
            emit OfferRemoved(nft, tokenId, offerer, OfferType.Native);
        }
    }

    function acceptOffer(address nft, uint256 tokenId, address offerer)
        external
        payable
        nonReentrant
        onlyTradableNFT(nft)
    {
        Offer storage offer = offers[nft][tokenId][offerer];
        uint256 wanted = counterPrice[nft][tokenId][offerer];

        require(offer.amount > 0 || wanted > 0 || offer.offerType == OfferType.NFT, "No offer");
        require(offer.expiry >= block.timestamp, "Offer not expired");

        address seller = IERC721(nft).ownerOf(tokenId);

        /* ──────────────────────────────────────────────
       A.  NFT‑for‑NFT swap  (must be started by seller)
    ───────────────────────────────────────────────*/
        if (offer.offerType == OfferType.NFT) {
            require(msg.sender == seller, "Only NFT owner");
            for (uint256 i = 0; i < offer.offerNfts.length; ++i) {
                address offerNft = offer.offerNfts[i];
                uint256 offerTokenId = offer.offerTokenIds[i];
                require(IERC721(offerNft).ownerOf(offerTokenId) == address(this), "NFT not escrowed");
                IERC721(offerNft).safeTransferFrom(address(this), seller, offerTokenId);
            }

            IERC721(nft).safeTransferFrom(seller, offerer, tokenId);

            delete listings[nft][tokenId];
            _offererSets[nft][tokenId].remove(offerer);
            delete offers[nft][tokenId][offerer];
            _revokeApproval(nft, tokenId, seller);

            emit NFTForNFTOfferAccepted(nft, tokenId, seller, offerer, offer.offerNfts, offer.offerTokenIds);
            return;
        }

        /* ──────────────────────────────────────────────
       B.  Seller accepts buyer’s *funded* ETH offer
    ───────────────────────────────────────────────*/
        if (msg.sender == seller) {
            require(offer.amount > 0, "Escrow empty");
            uint256 amount = offer.amount;

            _offererSets[nft][tokenId].remove(offerer);
            delete offers[nft][tokenId][offerer];
            delete listings[nft][tokenId];

            _handleRoyaltyAndPayout(nft, tokenId, seller, offerer, amount);
            IERC721(nft).safeTransferFrom(seller, offerer, tokenId);
            _revokeApproval(nft, tokenId, seller);

            emit OfferAccepted(nft, tokenId, seller, offerer, amount, OfferType.Native);
            return;
        }

        /* ──────────────────────────────────────────────
       C.  Buyer accepts seller’s counter‑offer
    ───────────────────────────────────────────────*/
        require(msg.sender == offerer, "Only buyer can pay");
        require(wanted > 0, "No counter offer");
        require(msg.value == wanted, "Send full counter price");
        require(offer.amount == 0, "Escrow must be refunded");

        _offererSets[nft][tokenId].remove(offerer);
        delete offers[nft][tokenId][offerer];
        delete counterPrice[nft][tokenId][offerer];
        delete listings[nft][tokenId];

        _handleRoyaltyAndPayout(nft, tokenId, seller, offerer, wanted);
        IERC721(nft).safeTransferFrom(seller, offerer, tokenId);
        _revokeApproval(nft, tokenId, seller);

        emit OfferAccepted(nft, tokenId, seller, offerer, wanted, OfferType.Native);
    }

    // --- Auctions ---
    function startAuction(address nft, uint256 tokenId, uint256 reservePrice, uint256 duration)
        external
        onlyTradableNFT(nft)
        onlyNFTOwner(nft, tokenId)
    {
        require(duration > 0, "Duration must be positive");
        require(auctions[nft][tokenId].endTime == 0, "Auction exists");
        require(
            IERC721(nft).getApproved(tokenId) == address(this)
                || IERC721(nft).isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );
        approvalStatus[nft][tokenId][msg.sender] = true;

        _activeAuctions.add(nft, tokenId);

        auctions[nft][tokenId] = Auction({
            nft: nft,
            tokenId: tokenId,
            seller: msg.sender,
            reservePrice: reservePrice,
            endTime: block.timestamp + duration,
            highestBidder: address(0),
            highestBid: 0,
            settled: false
        });
        emit AuctionStarted(nft, tokenId, msg.sender, reservePrice, block.timestamp + duration);
    }

    function bid(address nft, uint256 tokenId) external payable nonReentrant onlyTradableNFT(nft) {
        Auction storage auction = auctions[nft][tokenId];
        require(auction.endTime > 0, "No auction");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value >= ABSOLUTE_MIN_BID, "Bid below absolute minimum");

        // First bid must meet reserve price
        if (auction.highestBidder == address(0)) {
            require(msg.value >= auction.reservePrice, "Bid below reserve");
        } else {
            // Calculate minimum next bid (110% of current highest bid)
            // Check for overflow protection
            require(auction.highestBid <= type(uint256).max / MIN_BID_INCREMENT_BPS, "Bid too high for safe calculation");
            uint256 minNextBid = (auction.highestBid * MIN_BID_INCREMENT_BPS) / 10000;
            require(msg.value >= minNextBid, "Bid increment too low");
        }

        // Extend auction if bid is placed near the end
        if (auction.endTime - block.timestamp < AUCTION_EXTENSION_THRESHOLD) {
            auction.endTime = block.timestamp + AUCTION_TIME_EXTENSION;
            emit AuctionExtended(nft, tokenId, auction.endTime);
        }

        // Refund previous highest bidder
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).sendValue(auction.highestBid);
        }

        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;
        emit BidPlaced(nft, tokenId, msg.sender, msg.value);
    }

    function endAuction(address nft, uint256 tokenId) external nonReentrant onlyTradableNFT(nft) {
        _endAuction(nft, tokenId);
    }

    function refundAuctionBids(address nft, uint256 tokenId) external nonReentrant onlyTradableNFT(nft) {
        Auction storage auction = auctions[nft][tokenId];
        require(auction.endTime > 0, "No auction");
        require(auction.highestBidder != address(0), "No bids to refund");
        require(!auction.settled, "Auction already settled");

        // Check if seller no longer owns the NFT
        require(IERC721(nft).ownerOf(tokenId) != auction.seller, "Seller still owns NFT");

        // Refund the highest bidder
        uint256 refundAmount = auction.highestBid;
        address highestBidder = auction.highestBidder;

        // Clear auction state
        _activeAuctions.remove(nft, tokenId);
        delete auctions[nft][tokenId];

        // Refund the bidder
        payable(highestBidder).sendValue(refundAmount);

        emit AuctionBidsRefunded(nft, tokenId, highestBidder, refundAmount);
        emit AuctionEnded(nft, tokenId, address(0), 0);
    }

    // --- Internal ---
    function _handleRoyaltyAndPayout(address nft, uint256 tokenId, address seller, address buyer, uint256 amount)
        internal
    {
        // Check for overflow protection
        require(amount <= type(uint256).max / PLATFORM_FEE_BPS, "Amount too high for safe calculation");
        uint256 platformFee = (amount * PLATFORM_FEE_BPS) / 10000;
        uint256 remaining = amount - platformFee;

        if (platformFee > 0) {
            payable(PLATFORM_FEE_RECIPIENT).sendValue(platformFee);
            emit PlatformFeePaid(buyer, platformFee, PLATFORM_FEE_RECIPIENT);
        }

        (address royaltyReceiver, uint256 royaltyAmount) = _tryRoyaltyInfo(nft, tokenId, remaining);
        uint256 sellerAmount = remaining;
        if (royaltyReceiver != address(0) && royaltyAmount > 0 && royaltyAmount < remaining) {
            sellerAmount = remaining - royaltyAmount;
            payable(royaltyReceiver).sendValue(royaltyAmount);
            emit RoyaltyPaid(buyer, royaltyAmount, royaltyReceiver);
        }
        // Automatically send seller their proceeds instead of crediting to balance
        payable(seller).sendValue(sellerAmount);
    }

    function _tryRoyaltyInfo(address nft, uint256 tokenId, uint256 amount) internal view returns (address, uint256) {
        (bool ok, bytes memory data) =
            nft.staticcall(abi.encodeWithSignature("royaltyInfo(uint256,uint256)", tokenId, amount));
        if (ok && data.length == 64) {
            return abi.decode(data, (address, uint256));
        }
        return (address(0), 0);
    }

    function _isAddressInArray(address target, address[] memory array) internal pure returns (bool) {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == target) {
                return true;
            }
        }
        return false;
    }

    function _revokeApproval(address nft, uint256 tokenId, address owner) internal {
        if (approvalStatus[nft][tokenId][owner]) {
            try IERC721(nft).approve(address(0), tokenId) {
                approvalStatus[nft][tokenId][owner] = false;
                emit ApprovalRevoked(nft, tokenId, owner);
            } catch {
                approvalStatus[nft][tokenId][owner] = false;
            }
        }
    }

    function _isTradableNFT(address nft) internal view returns (bool) {
        try IERC721(nft).supportsInterface(type(IERC721).interfaceId) returns (bool ok) {
            return ok;
        } catch {
            return false;
        }
    }

    function _buy(address nft, uint256 tokenId) internal {
        Listing memory listing = listings[nft][tokenId];
        require(listing.price > 0, "Not listed");
        require(msg.value == listing.price, "Wrong price");
        address seller = listing.seller;
        require(seller != address(0), "Invalid seller");
        require(seller != msg.sender, "Cannot buy your own NFT");

        // Check if seller still owns the NFT before proceeding
        require(IERC721(nft).ownerOf(tokenId) == seller, "Seller no longer owns NFT");

        _listedNfts.remove(nft, tokenId);
        delete listings[nft][tokenId];
        _handleRoyaltyAndPayout(nft, tokenId, seller, msg.sender, listing.price);
        IERC721(nft).safeTransferFrom(seller, msg.sender, tokenId);
        _revokeApproval(nft, tokenId, seller);

        emit Sale(nft, tokenId, msg.sender, listing.price);
    }

    function _endAuction(address nft, uint256 tokenId) internal {
        Auction storage auction = auctions[nft][tokenId];
        require(auction.endTime > 0, "No auction");
        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(!auction.settled, "Already settled");
        auction.settled = true;

        _activeAuctions.remove(nft, tokenId);

        if (auction.highestBid >= auction.reservePrice && auction.highestBidder != address(0)) {
            // Check if seller still owns the NFT before proceeding
            require(IERC721(nft).ownerOf(tokenId) == auction.seller, "Seller no longer owns NFT");

            _handleRoyaltyAndPayout(nft, tokenId, auction.seller, auction.highestBidder, auction.highestBid);
            IERC721(nft).safeTransferFrom(auction.seller, auction.highestBidder, tokenId);
            _revokeApproval(nft, tokenId, auction.seller);

            // Clear the listing when auction is successfully settled
            delete listings[nft][tokenId];

            emit AuctionEnded(nft, tokenId, auction.highestBidder, auction.highestBid);
        } else {
            emit AuctionEnded(nft, tokenId, address(0), 0);
        }
    }

    // --- View Functions ---
    function getAllListedNfts() external view returns (NftIdentifier[] memory) {
        return _listedNfts.values();
    }

    function getAllActiveAuctions() external view returns (NftIdentifier[] memory) {
        return _activeAuctions.values();
    }

    function getAllOffersForNft(address nft, uint256 tokenId) external view returns (address[] memory) {
        return _offererSets[nft][tokenId].values();
    }

    function getListing(address nft, uint256 tokenId)
        external
        view
        returns (address nftAddr, uint256 tokenIdNum, address seller, uint256 price, address[] memory allowedBuyers)
    {
        Listing memory l = listings[nft][tokenId];
        return (l.nft, l.tokenId, l.seller, l.price, l.allowedBuyers);
    }

    function getOffer(address nft, uint256 tokenId, address offerer)
        external
        view
        returns (
            address nftAddr,
            uint256 tokenIdNum,
            address offererAddr,
            uint256 amount,
            uint256 expiry,
            OfferType offerType,
            address[] memory offerNfts,
            uint256[] memory offerTokenIds
        )
    {
        Offer memory o = offers[nft][tokenId][offerer];
        return (o.nft, o.tokenId, o.offerer, o.amount, o.expiry, o.offerType, o.offerNfts, o.offerTokenIds);
    }

    function getAuction(address nft, uint256 tokenId)
        external
        view
        returns (
            address nftAddr,
            uint256 tokenIdNum,
            address seller,
            uint256 reservePrice,
            uint256 endTime,
            address highestBidder,
            uint256 highestBid,
            bool settled
        )
    {
        Auction memory a = auctions[nft][tokenId];
        return (a.nft, a.tokenId, a.seller, a.reservePrice, a.endTime, a.highestBidder, a.highestBid, a.settled);
    }

    // --- ERC721Receiver ---
    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}

