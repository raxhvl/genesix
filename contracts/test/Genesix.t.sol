// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {Genesix} from "../src/Genesix.sol";

contract GenesixTest is Test {
    Genesix public genesix;
    address owner = makeAddr("owner");
    address approver = makeAddr("approver");
    address player = makeAddr("player");

    function setUp() public {
        genesix = new Genesix(owner);
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
        
        uint256[] memory retrieved = genesix.getPoints(player, 1, "sub-1");
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

        // First submission includes nickname
        _submitChallenge(1, "sub-1", _createPoints(values1), "player1");
        // Second submission has empty nickname
        _submitChallenge(1, "sub-2", _createPoints(values2), "");

        assertEq(genesix.balanceOf(player), 2);
        
        uint256[] memory sub1 = genesix.getPoints(player, 1, "sub-1");
        uint256[] memory sub2 = genesix.getPoints(player, 1, "sub-2");
        
        assertEq(sub1[0], 10);
        assertEq(sub2[0], 15);
    }

    function test_RevertUnauthorized() public {
        vm.prank(player);
        vm.expectRevert(abi.encodeWithSelector(Genesix.Unauthorized.selector));
        genesix.approveSubmission(1, "sub-1", player, "player1", new uint256[](3));
    }

    function test_RevertChallengeIdMismatch() public {
        _submitChallenge(1, "sub-1", new uint256[](3), "player1");
        
        vm.expectRevert(abi.encodeWithSelector(Genesix.ChallengeMismatch.selector, 1, 2));
        genesix.getPoints(player, 2, "sub-1");
    }

    function test_IgnoreUpdatingNickname() public {
        uint256[] memory points = new uint256[](3);
        
        // First submission sets the nickname
        vm.prank(approver);
        genesix.approveSubmission(1, "sub-1", player, "original-nickname", points);

        // Second submission with different nickname should be accepted but nickname ignored
        vm.prank(approver);
        genesix.approveSubmission(1, "sub-2", player, "different-nickname", points);

        // Both submissions should succeed
        assertEq(genesix.balanceOf(player), 2);

        // Verify the original nickname sticks using the getter
        assertEq(genesix.getNickname(player), "original-nickname");
    }
}