// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

struct NftIdentifier {
    address nft;
    uint256 tokenId;
}

library EnumerableStorage {
    struct NftSet {
        NftIdentifier[] _values;
        mapping(address => mapping(uint256 => uint256)) _indexes;
    }

    struct OffererSet {
        address[] _values;
        mapping(address => uint256) _indexes;
    }

    function add(NftSet storage set, address nft, uint256 tokenId) internal {
        if (set._indexes[nft][tokenId] == 0) {
            set._values.push(NftIdentifier({nft: nft, tokenId: tokenId}));
            set._indexes[nft][tokenId] = set._values.length;
        }
    }

    function remove(NftSet storage set, address nft, uint256 tokenId) internal {
        uint256 index = set._indexes[nft][tokenId];
        if (index > 0) {
            // Move the last element to the vacated slot
            if (index < set._values.length) {
                NftIdentifier memory last = set._values[set._values.length - 1];
                set._values[index - 1] = last;
                set._indexes[last.nft][last.tokenId] = index;
            }
            set._values.pop();
            delete set._indexes[nft][tokenId];
        }
    }

    function add(OffererSet storage set, address offerer) internal {
        if (set._indexes[offerer] == 0) {
            set._values.push(offerer);
            set._indexes[offerer] = set._values.length;
        }
    }

    function remove(OffererSet storage set, address offerer) internal {
        uint256 index = set._indexes[offerer];
        if (index > 0) {
            if (index < set._values.length) {
                address last = set._values[set._values.length - 1];
                set._values[index - 1] = last;
                set._indexes[last] = index;
            }
            set._values.pop();
            delete set._indexes[offerer];
        }
    }

    function values(NftSet storage set) internal view returns (NftIdentifier[] memory) {
        return set._values;
    }

    function values(OffererSet storage set) internal view returns (address[] memory) {
        return set._values;
    }
}
