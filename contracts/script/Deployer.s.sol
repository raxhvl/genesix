// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Genesix} from "../src/Genesix.sol";

contract Launch is Script {
    Genesix public genesix;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        genesix = new Genesix();

        vm.stopBroadcast();
    }
}
