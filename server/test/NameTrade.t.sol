// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {NameTrade} from "../src/NameTrade.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockNFT is ERC721 {
    constructor() ERC721("MockNFT", "MNFT") {}

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }
}

contract NameTradeTest is Test {
    NameTrade public nameTrade;
    MockNFT public mockNft;
    MockNFT public offerNft;

    address payable internal seller;
    address payable internal buyer;
    address payable internal offerer;
    address payable internal platformFeeRecipient;

    uint256 internal constant LISTING_PRICE = 1 ether;
    uint256 internal constant OFFER_AMOUNT = 0.5 ether;
    uint256 internal constant PLATFORM_FEE_BPS = 500; // 5%

    uint256 baseSepoliaFork;
    string BASE_SEPOLIA_RPC_URL = "https://sepolia.base.org";

    function setUp() public {
        baseSepoliaFork = vm.createSelectFork(BASE_SEPOLIA_RPC_URL);

        seller = payable(makeAddr("seller"));
        buyer = payable(makeAddr("buyer"));
        offerer = payable(makeAddr("offerer"));
        platformFeeRecipient = payable(makeAddr("platformFeeRecipient"));

        vm.deal(seller, 100 ether);
        vm.deal(buyer, 100 ether);
        vm.deal(offerer, 100 ether);

        nameTrade = new NameTrade(PLATFORM_FEE_BPS, platformFeeRecipient);
        mockNft = new MockNFT();
        offerNft = new MockNFT();

        mockNft.mint(seller, 1);
        offerNft.mint(offerer, 1);
    }

    function test_ListAndBuy() public {
        uint256 tokenId = 1;

        // Seller lists the NFT
        vm.startPrank(seller);
        mockNft.approve(address(nameTrade), tokenId);
        nameTrade.list(address(mockNft), tokenId, LISTING_PRICE);
        vm.stopPrank();

        (address nftAddr, uint256 tokenIdNum, address sellerAddr, uint256 priceVal, ) = nameTrade.getListing(address(mockNft), tokenId);
        assertEq(nftAddr, address(mockNft));
        assertEq(tokenIdNum, tokenId);
        assertEq(sellerAddr, seller);
        assertEq(priceVal, LISTING_PRICE);

        // Buyer buys the NFT
        uint256 platformFee = (LISTING_PRICE * PLATFORM_FEE_BPS) / 10000;
        uint256 sellerProceeds = LISTING_PRICE - platformFee;

        uint256 sellerInitialBalance = seller.balance;
        uint256 platformInitialBalance = platformFeeRecipient.balance;

        vm.startPrank(buyer);
        nameTrade.buy{value: LISTING_PRICE}(address(mockNft), tokenId);
        vm.stopPrank();

        assertEq(mockNft.ownerOf(tokenId), buyer, "NFT should be transferred to the buyer");
        assertEq(seller.balance, sellerInitialBalance + sellerProceeds, "Seller should receive proceeds");
        assertEq(platformFeeRecipient.balance, platformInitialBalance + platformFee, "Platform should receive fee");
    }

    function test_MakeAndAcceptNativeOffer() public {
        uint256 tokenId = 1;

        // Offerer makes a native offer
        vm.startPrank(offerer);
        nameTrade.makeNativeOffer{value: OFFER_AMOUNT}(address(mockNft), tokenId);
        vm.stopPrank();

        // Seller accepts the offer
        uint256 platformFee = (OFFER_AMOUNT * PLATFORM_FEE_BPS) / 10000;
        uint256 sellerProceeds = OFFER_AMOUNT - platformFee;

        uint256 sellerInitialBalance = seller.balance;
        uint256 platformInitialBalance = platformFeeRecipient.balance;

        vm.startPrank(seller);
        mockNft.approve(address(nameTrade), tokenId);
        nameTrade.acceptOffer(address(mockNft), tokenId, offerer);
        vm.stopPrank();

        assertEq(mockNft.ownerOf(tokenId), offerer, "NFT should be transferred to the offerer");
        assertEq(seller.balance, sellerInitialBalance + sellerProceeds, "Seller should receive proceeds");
        assertEq(platformFeeRecipient.balance, platformInitialBalance + platformFee, "Platform should receive fee");
    }

    function test_RemoveNativeOffer() public {
        uint256 tokenId = 1;

        // Offerer makes a native offer
        vm.startPrank(offerer);
        nameTrade.makeNativeOffer{value: OFFER_AMOUNT}(address(mockNft), tokenId);
        vm.stopPrank();

        // Offerer removes the offer
        uint256 offererInitialBalance = offerer.balance;
        vm.startPrank(offerer);
        nameTrade.removeOffer(address(mockNft), tokenId, offerer);
        vm.stopPrank();

        assertEq(offerer.balance, offererInitialBalance + OFFER_AMOUNT, "Offerer should be refunded");

        (, , , uint256 amount, , , , ) = nameTrade.getOffer(address(mockNft), tokenId, offerer);
        assertEq(amount, 0, "Offer amount should be zero after removal");
    }

    function test_SellerCounterOffer() public {
        uint256 tokenId = 1;
        uint256 counterPrice = 0.8 ether;

        // Offerer makes a native offer
        vm.startPrank(offerer);
        nameTrade.makeNativeOffer{value: OFFER_AMOUNT}(address(mockNft), tokenId);
        vm.stopPrank();

        // Seller makes a counter-offer
        uint256 offererInitialBalance = offerer.balance;
        vm.startPrank(seller);
        nameTrade.updateOffer(address(mockNft), tokenId, offerer, counterPrice, NameTrade.OfferType.Native);
        vm.stopPrank();

        assertEq(offerer.balance, offererInitialBalance + OFFER_AMOUNT, "Offerer should be refunded after counter-offer");
        (,,,,uint256 expiry,,,) = nameTrade.getOffer(address(mockNft), tokenId, offerer);
        assertTrue(expiry > block.timestamp, "Offer expiry should be updated");
    }

    function test_BuyerAcceptsCounterOffer() public {
        uint256 tokenId = 1;
        uint256 counterPrice = 0.8 ether;

        // Seller lists the NFT first, which includes approval
        vm.startPrank(seller);
        mockNft.approve(address(nameTrade), tokenId);
        nameTrade.list(address(mockNft), tokenId, 1 ether);
        vm.stopPrank();

        // Offerer makes a native offer
        vm.startPrank(offerer);
        nameTrade.makeNativeOffer{value: OFFER_AMOUNT}(address(mockNft), tokenId);
        vm.stopPrank();

        // Seller makes a counter-offer
        vm.startPrank(seller);
        nameTrade.updateOffer(address(mockNft), tokenId, offerer, counterPrice, NameTrade.OfferType.Native);
        vm.stopPrank();

        // Offerer (buyer) accepts the counter-offer
        uint256 platformFee = (counterPrice * PLATFORM_FEE_BPS) / 10000;
        uint256 sellerProceeds = counterPrice - platformFee;

        uint256 sellerInitialBalance = seller.balance;
        uint256 platformInitialBalance = platformFeeRecipient.balance;

        vm.startPrank(offerer);
        nameTrade.acceptOffer{value: counterPrice}(address(mockNft), tokenId, offerer);
        vm.stopPrank();

        assertEq(mockNft.ownerOf(tokenId), offerer, "NFT should be transferred to the offerer");
        assertEq(seller.balance, sellerInitialBalance + sellerProceeds, "Seller should receive proceeds");
        assertEq(platformFeeRecipient.balance, platformInitialBalance + platformFee, "Platform should receive fee");
    }

    function test_CancelListing() public {
        uint256 tokenId = 1;

        // Seller lists the NFT
        vm.startPrank(seller);
        mockNft.approve(address(nameTrade), tokenId);
        nameTrade.list(address(mockNft), tokenId, LISTING_PRICE);
        vm.stopPrank();

        // Seller cancels the listing
        vm.startPrank(seller);
        nameTrade.cancelListing(address(mockNft), tokenId);
        vm.stopPrank();

        (,,,uint256 priceVal,) = nameTrade.getListing(address(mockNft), tokenId);
        assertEq(priceVal, 0, "Listing price should be zero after cancellation");
    }

    function test_MakeAndAcceptNFTOffer() public {
        uint256 tokenIdToTrade = 1;
        uint256 tokenIdOffered = 1;

        // Offerer makes an NFT offer
        vm.startPrank(offerer);
        offerNft.approve(address(nameTrade), tokenIdOffered);
        address[] memory offerNfts = new address[](1);
        offerNfts[0] = address(offerNft);
        uint256[] memory offerTokenIds = new uint256[](1);
        offerTokenIds[0] = tokenIdOffered;
        nameTrade.makeNFTOffer(address(mockNft), tokenIdToTrade, offerNfts, offerTokenIds);
        vm.stopPrank();

        // Seller accepts the NFT offer
        vm.startPrank(seller);
        mockNft.approve(address(nameTrade), tokenIdToTrade);
        nameTrade.acceptOffer(address(mockNft), tokenIdToTrade, offerer);
        vm.stopPrank();

        assertEq(mockNft.ownerOf(tokenIdToTrade), offerer, "Traded NFT should be transferred to the offerer");
        assertEq(offerNft.ownerOf(tokenIdOffered), seller, "Offered NFT should be transferred to the seller");
    }
}
