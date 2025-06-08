// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/finance/ERC2981.sol";

contract DaedalusV2 is ERC721, Ownable, Pausable, ERC2981 {
    //Construtor que define o nome e o símbolo do token NFT
    constructor() ERC721("Daedalus Artwork", "DAED") {}

    //lógica do contrato (structs, funções de mint, etc.)

    //Funções de OpenZeppelin que precisamos para ter compatibilidade com marketplaces
    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}