// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console} from "forge-std/Test.sol";
import {Genesix} from "../src/Genesix.sol";

contract GenesixTest is Test {
    Genesix public genesix;
    address owner = makeAddr("owner");
    address approver = makeAddr("approver");
    address player = makeAddr("player");

    function setUp() public {
        genesix = new Genesix(owner);
    }

    function test_InitialState() public view {
        assertEq(genesix.owner(), owner);
        assertEq(genesix.name(), "Onchain Days");
        assertEq(genesix.symbol(), "OCD");
    }

    function test_AddApprover() public {
        vm.prank(owner);
        genesix.addApprover(approver);
        assertTrue(genesix.approvers(approver));
    }

    function test_RemoveApprover() public {
        vm.startPrank(owner);
        test_AddApprover();
        genesix.removeApprover(approver);
        vm.stopPrank();
        assertFalse(genesix.approvers(approver));
    }
}