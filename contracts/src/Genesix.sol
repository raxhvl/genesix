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
    mapping(address approver => bool isApproved) public approvers;

    struct Player {
        string nickname;
        mapping(uint256 challengeId => uint256[] points) points;
    }

    mapping(address => Player) public players;
    mapping(uint256 tokenId => uint256 challengeId) public tokenToChallengeId;

    /*############################/*
    ||           Events           ||
    /*############################*/
    event ApproverAdded(address indexed approver);
    event ApproverRemoved(address indexed approver);

    /*############################/*
    ||            Errors          ||
    /*############################*/
    /// @notice Thrown when a caller doesn't have required permissions
    /// @dev User is not authorized to perform the requested action
    error Unauthorized();

    /*############################/*
    ||         Modifiers          ||
    /*############################*/
    modifier onlyApprover() {
        require(approvers[msg.sender], Unauthorized());
        _;
    }

    constructor(address initialOwner) ERC721("Onchain Days", "OCD") Ownable(initialOwner) {}

    /*############################/*
    ||                            ||
    ||         Public API         ||
    ||                            ||
    /*############################*/
    
    /// @notice Get the points earned by a player for a specific challenge
    /// @param playerAddress The address of the player
    /// @param challengeId The ID of the challenge
    /// @return An array of points earned for the challenge
    function getChallengePoints(address playerAddress, uint256 challengeId) public view returns (uint256[] memory) {
        return players[playerAddress].points[challengeId];
    }

    //TODO:  rename answers to points
    //TODO: add challenge to players array.
    /// @notice Approve a player's challenge submission and mint an NFT
    /// @param challengeId The ID of the challenge being submitted
    /// @param playerAddress The address of the player submitting the challenge
    /// @param nickname The nickname of the player (optional if already set)
    /// @param points Array of points earned for the challenge
    /// @dev Only callable by approved approvers
    function approveSubmission(uint256 challengeId, address playerAddress, string calldata nickname, uint256[] calldata points)
        public
        onlyApprover
    {
        Player storage player = players[playerAddress];

        // Players may submit challenges in any order.
        // This allows them to update their nickname, if not already set.
        if (bytes(nickname).length > 0 && keccak256(bytes(player.nickname)) != keccak256(bytes(nickname))) {
            player.nickname = nickname;
        }

        for (uint256 i = 0; i < points.length; i++) {
            player.points[challengeId].push(points[i]);
        }

        uint256 tokenId = _nextTokenId++;

        // Record an NFT against a challenge and mint it.
        tokenToChallengeId[tokenId] = challengeId;
        _safeMint(playerAddress, tokenId);
    }

    // Approver management
    /// @notice Add a new approver address
    /// @param _approver The address to be granted approver rights
    /// @dev Only callable by contract owner
    function addApprover(address _approver) external onlyOwner {
        // TODO: define a customer error?
        require(!approvers[_approver], "Already approver");
        approvers[_approver] = true;
        emit ApproverAdded(_approver);
    }

    /// @notice Remove an existing approver
    /// @param _approver The address to remove approver rights from
    /// @dev Only callable by contract owner
    function removeApprover(address _approver) external onlyOwner {
        // TODO: define a customer error?
        require(approvers[_approver], "Not approver");
        approvers[_approver] = false;
        emit ApproverRemoved(_approver);
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
