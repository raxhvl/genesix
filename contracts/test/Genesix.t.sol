// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console} from "forge-std/Test.sol";
import {Genesix} from "../src/Genesix.sol";

contract GenesixTest is Test {
    Genesix public genesix;

    address owner = makeAddr("Owner");


    function setUp() public {
        genesix = new Genesix(owner);
    }
}
