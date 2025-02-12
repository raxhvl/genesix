// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {Genesix} from "../src/Genesix.sol";

// Run using
// forge script --chain anvil script/Deployer.s.sol:Launch --rpc-url http://localhost:8545 --broadcast -vvvv --interactives 1
contract Launch is Script {
    Genesix public genesix;


    address owner =  address(this);
    // Deployment TODO:
    // 1. Replace owner address
    address wallet = address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        genesix = new Genesix(wallet);
        // TODO: Remove automatic addition of owner as approver
        genesix.addApprover(wallet);

        vm.stopBroadcast();
    }
}
