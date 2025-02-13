// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
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
contract Genesix is ERC721, ERC721Enumerable, Ownable {
    /*###########################/*
    ||           State           ||
    /*###########################*/
    uint256 private _nextTokenId;
    mapping(address => bool) public isApprover;
    uint256 public immutable deadline;

    // Change mapping names and visibility
    mapping(uint256 tokenId => uint256 challengeId) public tokenChallenge;
    mapping(uint256 tokenId => string submissionId) public tokenSubmission;

    // Add new mapping to track completed challenges
    mapping(address player => mapping(uint256 challengeId => bool completed)) public completedChallenges;

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
    /// @notice Emitted when a submission is approved
    /// @param playerAddress The address of the player who submitted
    /// @param challengeId The ID of the challenge
    /// @param nickname The nickname of the player
    /// @param totalPoints The total points awarded for the submission
    /// @param tokenId The ID of the NFT minted for this submission
    event SubmissionApproved(
        address indexed playerAddress,
        uint256 indexed challengeId,
        string nickname,
        uint256 totalPoints,
        uint256 indexed tokenId
    );

    /*############################/*
    ||            Errors          ||
    /*############################*/
    /// @notice Thrown when a caller doesn't have required permissions
    error Unauthorized();
    /// @notice Thrown when trying to add an address that is already an approver
    error AlreadyApprover(address account);
    /// @notice Thrown when trying to remove an address that is not an approver
    error NotApprover(address account);
    /// @notice Thrown when trying to perform an action after the deadline
    /// @param deadline The deadline that was missed
    /// @param currentTime The current block timestamp
    error DeadlineExceeded(uint256 deadline, uint256 currentTime);
    // Add new error
    /// @notice Thrown when a player tries to submit the same challenge twice
    /// @param player The address of the player
    /// @param challengeId The ID of the challenge
    error ChallengeAlreadyCompleted(address player, uint256 challengeId);

    /*############################/*
    ||         Modifiers          ||
    /*############################*/
    modifier onlyApprover() {
        require(isApprover[msg.sender], Unauthorized());
        _;
    }

    /// @notice Check if contract deadline has passed, with 3-day grace period
    modifier beforeDeadline() {
        // The deadline is for front-end users, to prevent submissions.
        // However, approvers are granted a 3-day grace period to approve submissions.
        if (block.timestamp > deadline + 3 days) {
            revert DeadlineExceeded(deadline, block.timestamp);
        }
        _;
    }

    /// @notice Contract constructor
    /// @param initialOwner The address that will own the contract
    constructor(
        address initialOwner
    ) ERC721("EF Onchain Days", "OCD") Ownable(initialOwner) {
        deadline = 1739491200;
    }

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
    ) public onlyApprover beforeDeadline {
        // Add check for duplicate submission
        if (completedChallenges[playerAddress][challengeId]) {
            revert ChallengeAlreadyCompleted(playerAddress, challengeId);
        }

        Player storage profile = profiles[playerAddress];

        // Only set nickname if it hasn't been set before
        if (bytes(nickname).length > 0 && bytes(profile.nickname).length == 0) {
            profile.nickname = nickname;
        }

        profile.submissions[submissionId] = Submission({
            challengeId: challengeId,
            points: points
        });

        uint256 tokenId = _nextTokenId++;
        tokenChallenge[tokenId] = challengeId; // Store challenge ID for the token
        tokenSubmission[tokenId] = submissionId;
        completedChallenges[playerAddress][challengeId] = true; // Mark as completed
        _safeMint(playerAddress, tokenId);

        // Calculate total points
        uint256 totalPoints = 0;
        for (uint256 i = 0; i < points.length; i++) {
            totalPoints += points[i];
        }

        emit SubmissionApproved(
            playerAddress,
            challengeId,
            profile.nickname,
            totalPoints,
            tokenId
        );
    }

    /// @notice Get points for a specific token
    /// @param tokenId The ID of the token
    /// @return points Array of points from the submission
    function getPoints(uint256 tokenId) public view returns (uint256[] memory) {
        _requireOwned(tokenId);
        address owner = ownerOf(tokenId);
        string memory submissionId = tokenSubmission[tokenId];
        return profiles[owner].submissions[submissionId].points;
    }

    /// @notice Get a player's nickname
    /// @param playerAddress The address of the player
    /// @return The player's nickname
    function getNickname(address playerAddress) public view returns (string memory) {
        return profiles[playerAddress].nickname;
    }

    // Approver management
    /// @notice Add a new approver address
    /// @param account The address to be granted approver rights
    /// @dev Only callable by contract owner and before any challenge deadline
    function addApprover(address account) external onlyOwner beforeDeadline {
        if (isApprover[account]) revert AlreadyApprover(account);
        isApprover[account] = true;
    }

    /// @notice Remove an existing approver
    /// @param account The address to remove approver rights from
    /// @dev Only callable by contract owner and before any challenge deadline
    function removeApprover(address account) external onlyOwner beforeDeadline {
        if (!isApprover[account]) revert NotApprover(account);
        isApprover[account] = false;
    }

    /*############################/*
    ||          Private           ||
    /*############################*/
    /// @notice Returns the base URI for computing token URIs
    /// @return The base URI string
    function _baseURI() internal pure override returns (string memory) {
        return "https://genesix.raxhvl.com/api/nft";
    }

    /// @notice Returns token URI by combining base URI with challenge ID and token ID
    /// @param tokenId The ID of the token
    /// @return The token URI string
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        uint256 challengeId = tokenChallenge[tokenId];
        return string(abi.encodePacked(
            _baseURI(),
            "/",
            _toString(challengeId),
            "/",
            _toString(tokenId)
        ));
    }

    /// @notice Get the challenge ID associated with a token
    /// @param tokenId The ID of the token
    /// @return The challenge ID
    function getChallengeId(uint256 tokenId) public view returns (uint256) {
        _requireOwned(tokenId);
        return tokenChallenge[tokenId];
    }

    /// @notice Get the token ID for a player's completed challenge
    /// @param player The address of the player
    /// @param challengeId The ID of the challenge
    /// @return tokenId The ID of the token, or revert if not found
    function getTokenForChallenge(address player, uint256 challengeId) public view returns (uint256) {
        uint256 balance = balanceOf(player);
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(player, i);
            if (tokenChallenge[tokenId] == challengeId) {
                return tokenId;
            }
        }
        revert("Challenge not completed");
    }

    /// @notice Convert uint256 to string
    /// @param value The number to convert
    /// @return The string representation
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // The following functions are overrides required by Solidity.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
