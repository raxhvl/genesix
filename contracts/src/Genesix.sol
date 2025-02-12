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
    uint256 public immutable deadline;

    // Add mapping to track token metadata
    mapping(uint256 tokenId => uint256 challengeId) private _tokenChallenge;

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
    /// @param submissionId The unique ID of the submission
    /// @param points The array of points awarded for each task
    /// @param tokenId The ID of the NFT minted for this submission
    event SubmissionApproved(
        address indexed playerAddress,
        uint256 indexed challengeId,
        string submissionId,
        uint256[] points,
        uint256 indexed tokenId
    );

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
    /// @notice Thrown when trying to perform an action after the deadline
    /// @param deadline The deadline that was missed
    /// @param currentTime The current block timestamp
    error DeadlineExceeded(uint256 deadline, uint256 currentTime);

    /*############################/*
    ||         Modifiers          ||
    /*############################*/
    modifier onlyApprover() {
        require(isApprover[msg.sender], Unauthorized());
        _;
    }

    /// @notice Check if contract deadline has passed
    modifier beforeDeadline() {
        if (block.timestamp > deadline) {
            revert DeadlineExceeded(deadline, block.timestamp);
        }
        _;
    }

    /// @notice Contract constructor
    /// @param initialOwner The address that will own the contract
    constructor(
        address initialOwner
    ) ERC721("Onchain Days", "OCD") Ownable(initialOwner) {
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
        _tokenChallenge[tokenId] = challengeId; // Store challenge ID for the token
        _safeMint(playerAddress, tokenId);

        emit SubmissionApproved(
            playerAddress,
            challengeId,
            submissionId,
            points,
            tokenId
        );
    }

    /// @notice Get points for a specific submission
    /// @param playerAddress The address of the player
    /// @param challengeId The ID of the challenge
    /// @param submissionId The ID of the submission
    /// @return points Array of points from the submission
    function getPoints(
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
        uint256 challengeId = _tokenChallenge[tokenId];
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
        return _tokenChallenge[tokenId];
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
}
