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

    /// @notice Test submission approval
    /// @dev Tests approver can approve a submission with points
    function test_ApproveSubmission() public {
        // Setup
        vm.startPrank(owner);
        genesix.addApprover(approver);
        vm.stopPrank();

        // Prepare test data
        uint256 challengeId = 1;
        string memory nickname = "player1";
        uint256[] memory points = new uint256[](6);
        points[0] = 10;
        points[1] = 20;
        points[2] = 30;

        // Submit as approver
        vm.startPrank(approver);
        genesix.approveSubmission(challengeId, player, nickname, points);
        vm.stopPrank();

        // Verify results
        assertEq(genesix.balanceOf(player), 1);
        assertEq(genesix.tokenToChallengeId(0), challengeId);
    }

    /// @notice Test getting challenge points
    /// @dev Tests retrieving points for a specific challenge after submission
    function test_GetChallengePoints() public {
        // Setup
        vm.startPrank(owner);
        genesix.addApprover(approver);
        vm.stopPrank();

        // Prepare test data
        uint256 challengeId = 1;
        string memory nickname = "player1";
        uint256[] memory points = new uint256[](3);
        points[0] = 10;
        points[1] = 20;
        points[2] = 30;

        // Submit as approver
        vm.prank(approver);
        genesix.approveSubmission(challengeId, player, nickname, points);

        // Get and verify points
        uint256[] memory retrievedPoints = genesix.getChallengePoints(player, challengeId);
        assertEq(retrievedPoints.length, points.length);
        for(uint256 i = 0; i < points.length; i++) {
            assertEq(retrievedPoints[i], points[i]);
        }
    }

    /// @notice Test unauthorized submission approval
    /// @dev Tests that non-approvers cannot approve submissions
    function test_RevertWhen_UnauthorizedApproval() public {
        uint256[] memory points = new uint256[](6);
        
        vm.expectRevert(abi.encodeWithSelector(Genesix.Unauthorized.selector));
        vm.prank(player);
        genesix.approveSubmission(1, player, "player1", points);
    }
}