// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Script, console} from "forge-std/Script.sol";
import {Genesix} from "../src/Genesix.sol";

contract Launch is Script {
    Genesix public genesix;

    // Deployment TODO:
    // 1. Replace owner address

    address owner = makeAddr("Owner");

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        genesix = new Genesix(owner);

        vm.stopBroadcast();
    }
}
