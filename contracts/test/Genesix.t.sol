// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console} from "forge-std/Test.sol";
import {Genesix} from "../src/Genesix.sol";

/// @title Genesix Contract Tests
/// @notice Test suite for the Genesix NFT contract
contract GenesixTest is Test {
    Genesix public genesix;
    address owner = makeAddr("owner");
    address approver = makeAddr("approver");
    address player = makeAddr("player");

    function setUp() public {
        genesix = new Genesix(owner);
    }

    /// @notice Test initial contract state after deployment
    /// @dev Verifies owner address, token name and symbol
    function test_InitialState() public view {
        assertEq(genesix.owner(), owner);
        assertEq(genesix.name(), "Onchain Days");
        assertEq(genesix.symbol(), "OCD");
    }

    /// @notice Test adding an approver
    /// @dev Tests owner can add approver and verifies approver status
    function test_AddApprover() public {
        vm.prank(owner);
        genesix.addApprover(approver);
        vm.stopPrank();
        assertTrue(genesix.approvers(approver));
    }

    /// @notice Test removing an approver
    /// @dev Tests owner can remove previously added approver
    function test_RemoveApprover() public {
        test_AddApprover();
        vm.prank(owner);
        genesix.removeApprover(approver);
        vm.stopPrank();
        assertFalse(genesix.approvers(approver));
    }
}