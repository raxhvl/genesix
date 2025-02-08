// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Genesix} from "../src/Genesix.sol";

contract CounterTest is Test {
    Genesix public genesix;

    function setUp() public {
        genesix = new Genesix();
        genesix.setNumber(0);
    }

    function test_Increment() public {
        genesix.increment();
        assertEq(genesix.number(), 1);
    }
}
