// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {NameTrade} from "../src/NameTrade.sol";

contract DeployNameTrade is Script {
    function run() public returns (NameTrade) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        require(deployerPrivateKey != 0, "PRIVATE_KEY environment variable not set");

        uint256 platformFeeBps = 500; // 5%
        address platformFeeRecipient = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        NameTrade nameTrade = new NameTrade(platformFeeBps, platformFeeRecipient);

        vm.stopBroadcast();
        return nameTrade;
    }
}
