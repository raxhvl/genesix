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
    mapping(address => bool) public approvers;
   
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
    constructor(address initialOwner)
        ERC721("Onchain Days", "OCD")
        Ownable(initialOwner)
    {}

    /*############################/*
    ||                            ||
    ||         Public API         ||
    ||                            ||
    /*############################*/
    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    // Approver management
    function addApprover(address _approver) external onlyOwner {
        require(!approvers[_approver], "Already approver");
        approvers[_approver] = true;
        emit ApproverAdded(_approver);
    }

    function removeApprover(address _approver) external onlyOwner {
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