// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {Genesix} from "../src/Genesix.sol";

contract GenesixTest is Test {
    Genesix public genesix;
    address owner = makeAddr("owner");
    address approver = makeAddr("approver");
    address player = makeAddr("player");
    uint256 deadline;

    function setUp() public {
        genesix = new Genesix(owner);
        deadline = genesix.deadline();
        vm.prank(owner);
        genesix.addApprover(approver);
    }

    function _createPoints(uint256[] memory values) internal pure returns (uint256[] memory) {
        uint256[] memory points = new uint256[](values.length);
        for(uint256 i = 0; i < values.length; i++) {
            points[i] = values[i];
        }
        return points;
    }

    function _submitChallenge(
        uint256 challengeId,
        string memory submissionId,
        uint256[] memory points,
        string memory nickname
    ) internal {
        vm.prank(approver);
        genesix.approveSubmission(
            challengeId,
            submissionId,
            player,
            nickname,
            points
        );
    }

    function test_InitialState() public {
        assertEq(genesix.owner(), owner);
        assertEq(genesix.name(), "Onchain Days");
        assertEq(genesix.symbol(), "OCD");
    }

    function test_ApproverManagement() public {
        assertTrue(genesix.isApprover(approver));
        
        vm.prank(owner);
        genesix.removeApprover(approver);
        assertFalse(genesix.isApprover(approver));
    }

    function test_SingleSubmission() public {
        uint256[] memory values = new uint256[](3);
        values[0] = 10;
        values[1] = 20;
        values[2] = 30;
        uint256[] memory points = _createPoints(values);
        _submitChallenge(1, "sub-1", points, "player1");

        assertEq(genesix.balanceOf(player), 1);
        
        uint256[] memory retrieved = genesix.getPoints(0);
        assertEq(retrieved[0], 10);
        assertEq(retrieved[1], 20);
        assertEq(retrieved[2], 30);
    }

    function test_MultipleSubmissions() public {
        uint256[] memory values1 = new uint256[](3);
        values1[0] = 10;
        values1[1] = 20;
        values1[2] = 30;
        
        uint256[] memory values2 = new uint256[](3);
        values2[0] = 15;
        values2[1] = 25;
        values2[2] = 35;

        _submitChallenge(1, "sub-1", _createPoints(values1), "player1");
        _submitChallenge(2, "sub-2", _createPoints(values2), "");

        assertEq(genesix.balanceOf(player), 2);
        
        uint256[] memory sub1 = genesix.getPoints(0);
        uint256[] memory sub2 = genesix.getPoints(1);
        
        assertEq(sub1[0], 10);
        assertEq(sub2[0], 15);
    }

    function test_RevertUnauthorized() public {
        vm.prank(player);
        vm.expectRevert(abi.encodeWithSelector(Genesix.Unauthorized.selector));
        genesix.approveSubmission(1, "sub-1", player, "player1", new uint256[](3));
    }

    function test_IgnoreUpdatingNickname() public {
        uint256[] memory points = new uint256[](3);
        
        // First submission sets the nickname
        vm.prank(approver);
        genesix.approveSubmission(1, "sub-1", player, "original-nickname", points);

        // Second submission with different nickname should be accepted but nickname ignored
        vm.prank(approver);
        genesix.approveSubmission(2, "sub-2", player, "different-nickname", points);

        // Both submissions should succeed
        assertEq(genesix.balanceOf(player), 2);

        // Verify the original nickname sticks using the getter
        assertEq(genesix.getNickname(player), "original-nickname");
    }

    function test_SetAndEnforceDeadline() public {
        uint256[] memory points = new uint256[](3);
        
        // Submission before deadline should work
        _submitChallenge(1, "sub-1", points, "player1");
        assertEq(genesix.balanceOf(player), 1);

        // Warp to after deadline
        vm.warp(deadline + 1);

        // Submission after deadline should fail
        vm.expectRevert(abi.encodeWithSelector(
            Genesix.DeadlineExceeded.selector,
            deadline,
            deadline + 1
        ));
        _submitChallenge(1, "sub-2", points, "");
    }

    function test_DeadlineZeroMeansNoDeadline() public {
        // Deploy new contract with no deadline
        genesix = new Genesix(owner);
        vm.prank(owner);
        genesix.addApprover(approver);
        
        // Warp far into the future
        vm.warp(block.timestamp + 3 days);

        // Submission should still work
        uint256[] memory points = new uint256[](3);
        _submitChallenge(1, "sub-1", points, "player1");
        assertEq(genesix.balanceOf(player), 1);
    }

    function test_RevertApproverManagementAfterDeadline() public {
        // Warp to after deadline
        vm.warp(deadline + 1);

        // Try to add new approver after deadline
        address newApprover = makeAddr("newApprover");
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(
            Genesix.DeadlineExceeded.selector,
            deadline,
            deadline + 1
        ));
        genesix.addApprover(newApprover);

        // Try to remove approver after deadline
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(
            Genesix.DeadlineExceeded.selector,
            deadline,
            deadline + 1
        ));
        genesix.removeApprover(approver);
    }

    function test_TokenURIIncludesChallengeId() public {
        uint256[] memory points = new uint256[](3);
        uint256 challengeId = 1;
        _submitChallenge(challengeId, "sub-1", points, "player1");
        
        uint256 tokenId = 0; // First token
        assertEq(genesix.getChallengeId(tokenId), challengeId);
        assertEq(
            genesix.tokenURI(tokenId),
            string(abi.encodePacked(
                "https://genesix.raxhvl.com/api/nft",
                "/",
                "1", // challengeId
                "/",
                "0"  // tokenId
            ))
        );
    }

    function test_DifferentChallengesHaveDifferentURIs() public {
        uint256[] memory points = new uint256[](3);
        
        // Submit two different challenges
        _submitChallenge(1, "sub-1", points, "player1");
        _submitChallenge(2, "sub-2", points, "player1");
        
        assertEq(genesix.getChallengeId(0), 1);
        assertEq(genesix.getChallengeId(1), 2);
        
        assertTrue(
            keccak256(bytes(genesix.tokenURI(0))) != 
            keccak256(bytes(genesix.tokenURI(1)))
        );
    }

    function test_GetTokenForChallenge() public {
        // Submit two different challenges for the same player
        uint256[] memory points = new uint256[](3);
        points[0] = 10;
        points[1] = 20;
        points[2] = 30;

        _submitChallenge(1, "sub-1", points, "player1"); // tokenId 0
        _submitChallenge(2, "sub-2", points, "");        // tokenId 1

        // Check if we can get the correct token IDs
        assertEq(genesix.getTokenForChallenge(player, 1), 0);
        assertEq(genesix.getTokenForChallenge(player, 2), 1);
    }

    function test_GetTokenForChallengeReverts() public {
        // Try to get token for non-existent challenge
        vm.expectRevert("Challenge not completed");
        genesix.getTokenForChallenge(player, 999);

        // Submit a challenge
        uint256[] memory points = new uint256[](3);
        _submitChallenge(1, "sub-1", points, "player1");

        // Try to get token for different challenge
        vm.expectRevert("Challenge not completed");
        genesix.getTokenForChallenge(player, 2);

        // Try to get token for non-existent player
        address nonPlayer = makeAddr("nonPlayer");
        vm.expectRevert("Challenge not completed");
        genesix.getTokenForChallenge(nonPlayer, 1);
    }

    function test_SubmissionApprovedEvent() public {
        uint256[] memory points = new uint256[](3);
        points[0] = 10;
        points[1] = 20;
        points[2] = 30;
        uint256 challengeId1 = 1;
        uint256 challengeId2 = 2;
        string memory nickname = "player1";
        uint256 expectedTotalPoints = 60; // 10 + 20 + 30
        uint256 expectedTokenId = 0; // First token

        // Expect the event with correct parameters
        vm.expectEmit(true, true, true, true);
        emit Genesix.SubmissionApproved(
            player,
            challengeId1,
            nickname,
            expectedTotalPoints,
            expectedTokenId
        );

        _submitChallenge(challengeId1, "sub-1", points, nickname);

        // Test subsequent submission keeps same nickname
        uint256 secondTokenId = 1;
        vm.expectEmit(true, true, true, true);
        emit Genesix.SubmissionApproved(
            player,
            challengeId2,
            nickname, // Should keep original nickname
            expectedTotalPoints,
            secondTokenId
        );

        _submitChallenge(challengeId2, "sub-2", points, "different-nickname");
    }

    function test_PreventDuplicateChallengeSubmission() public {
        uint256[] memory points = new uint256[](3);
        points[0] = 10;
        points[1] = 20;
        points[2] = 30;

        // First submission should succeed
        _submitChallenge(1, "sub-1", points, "player1");
        
        // Second submission of same challenge should fail
        vm.expectRevert(abi.encodeWithSelector(
            Genesix.ChallengeAlreadyCompleted.selector,
            player,
            1
        ));
        _submitChallenge(1, "sub-2", points, "player1");

        // Different challenge ID should still work
        _submitChallenge(2, "sub-3", points, "player1");
    }
}