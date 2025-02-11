// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/*****************************************
*  ▗▄▄▖▗▄▄▄▖▗▖  ▗▖▗▄▄▄▖ ▗▄▄▖▗▄▄▄▖▗▖  ▗▖  *
* ▐▌   ▐▌   ▐▛▚▖▐▌▐▌   ▐▌     █   ▝▚▞▘   * 
* ▐▌▝▜▌▐▛▀▀▘▐▌ ▝▜▌▐▛▀▀▘ ▝▀▚▖  █    ▐▌    * 
* ▝▚▄▞▘▐▙▄▄▖▐▌  ▐▌▐▙▄▄▖▗▄▄▞▘▗▄█▄▖▗▞▘▝▚▖  *
*                                        *
******************************************/ 

/// @title Genesix - An NFT-based challenge completion tracking system
/// @notice This contract manages challenge submissions and approvals for players
/// @dev Extends ERC721 for NFT functionality and Ownable for access control
contract Genesix is ERC721, Ownable {
    /*###########################/*
    ||           State           ||
    /*###########################*/
    uint256 private _nextTokenId;
    mapping(address => bool) public isApprover;

    struct Submission {
        uint256 challengeId;
        uint256[] points;
    }

    struct Player {
        string nickname;
        mapping(string submissionId => Submission) submissions;
    }

    mapping(address => Player) public profiles;

    /*############################/*
    ||           Events           ||
    /*############################*/
    event ApproverAdded(address indexed approver);
    event ApproverRemoved(address indexed approver);

    /*############################/*
    ||            Errors          ||
    /*############################*/
    /// @notice Thrown when a caller doesn't have required permissions
    error Unauthorized();
    /// @notice Thrown when attempting to access a submission with wrong challenge ID
    /// @param expected The challenge ID that was expected
    /// @param actual The challenge ID that was provided
    error ChallengeMismatch(uint256 expected, uint256 actual);
    /// @notice Thrown when trying to add an address that is already an approver
    error AlreadyApprover(address account);
    /// @notice Thrown when trying to remove an address that is not an approver
    error NotApprover(address account);

    /*############################/*
    ||         Modifiers          ||
    /*############################*/
    modifier onlyApprover() {
        require(isApprover[msg.sender], Unauthorized());
        _;
    }

    constructor(address initialOwner) ERC721("Onchain Days", "OCD") Ownable(initialOwner) {}

    /*############################/*
    ||                            ||
    ||         Public API         ||
    ||                            ||
    /*############################*/
    

    //TODO:  rename answers to points
    //TODO: add challenge to players array.
    /// @notice Approve a player's challenge submission and mint an NFT
    /// @param challengeId The ID of the challenge being submitted
    /// @param submissionId The ID of the submission
    /// @param playerAddress The address of the player submitting the challenge
    /// @param nickname The nickname of the player (optional if already set)
    /// @param points Array of points earned for the challenge
    /// @dev Only callable by approved approvers
    function approveSubmission(
        uint256 challengeId,
        string calldata submissionId,
        address playerAddress,
        string calldata nickname,
        uint256[] calldata points
    ) public onlyApprover {
        Player storage profile = profiles[playerAddress];

        // Players may submit challenges in any order.
        // This allows them to update their nickname, if not already set.
        if (bytes(nickname).length > 0 && keccak256(bytes(profile.nickname)) != keccak256(bytes(nickname))) {
            profile.nickname = nickname;
        }

        profile.submissions[submissionId] = Submission({
            challengeId: challengeId,
            points: points
        });

        // Mint NFT without tracking challenge
        _safeMint(playerAddress, _nextTokenId++);
    }

    /// @notice Get points for a specific submission
    /// @param playerAddress The address of the player
    /// @param challengeId The ID of the challenge
    /// @param submissionId The ID of the submission
    /// @return points Array of points from the submission
    function getSubmissionPoints(
        address playerAddress,
        uint256 challengeId,
        string calldata submissionId
    ) public view returns (uint256[] memory) {
        Submission memory submission = profiles[playerAddress].submissions[submissionId];
        if (submission.challengeId != challengeId) {
            revert ChallengeMismatch(submission.challengeId, challengeId);
        }
        return submission.points;
    }

    // Approver management
    /// @notice Add a new approver address
    /// @param account The address to be granted approver rights
    /// @dev Only callable by contract owner
    function addApprover(address account) external onlyOwner {
        if (isApprover[account]) revert AlreadyApprover(account);
        isApprover[account] = true;
        emit ApproverAdded(account);
    }

    /// @notice Remove an existing approver
    /// @param account The address to remove approver rights from
    /// @dev Only callable by contract owner
    function removeApprover(address account) external onlyOwner {
        if (!isApprover[account]) revert NotApprover(account);
        isApprover[account] = false;
        emit ApproverRemoved(account);
    }

    /*############################/*
    ||          Private           ||
    /*############################*/
    /// @notice Returns the base URI for computing token URIs
    /// @return The base URI string
    function _baseURI() internal pure override returns (string memory) {
        return "http://TODO.com/token";
    }
}
