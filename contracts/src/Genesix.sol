// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

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
    uint256 private _nextTokenId;

    constructor(address initialOwner)
        ERC721("Onchain Days", "OCD")
        Ownable(initialOwner)
    {}

    function _baseURI() internal pure override returns (string memory) {
        return "http://TODO.com/token";
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }
}