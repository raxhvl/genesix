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
    //TODO:  rename answers to points
    //TODO: add challenge to players array.
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
    function addApprover(address _approver) external onlyOwner {
        // TODO: define a customer error?
        require(!approvers[_approver], "Already approver");
        approvers[_approver] = true;
        emit ApproverAdded(_approver);
    }

    function removeApprover(address _approver) external onlyOwner {
        // TODO: define a customer error?
        require(approvers[_approver], "Not approver");
        approvers[_approver] = false;
        emit ApproverRemoved(_approver);
    }

    /*############################/*
    ||          Private           ||
    /*############################*/
    function _baseURI() internal pure override returns (string memory) {
        return "http://TODO.com/token";
    }
}
