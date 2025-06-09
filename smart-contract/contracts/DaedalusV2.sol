// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// === IMPORTAÇÕES CORRIGIDAS E NECESSÁRIAS ===
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol"; // Caminho corrigido

/**
 * @title DaedalusV2
 * @notice Contrato MVP compatível com OpenZeppelin v5.x.
 */
contract DaedalusV2 is ERC721, ERC721Enumerable, Ownable, ERC2981 {

    // === VARIÁVEIS DE ESTADO (Sem alterações) ===
    uint256 private _nextTokenId = 1; // Inicia em 1 para evitar tokenId 0

    struct Artwork {
        address creator;
        uint256 price;
        string metadataURI;
    }

    mapping(uint256 => Artwork) private _artworks;

    // === CONSTRUTOR (Sem alterações) ===
    constructor() ERC721("Daedalus Artwork", "DAED") Ownable(msg.sender) {
        _setDefaultRoyalty(msg.sender, 500); // 5%
    }

    // === FUNÇÕES PRINCIPAIS (Sem alterações na lógica interna) ===

    function mintArtwork(string memory metadataURI_, uint256 price_) public {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _artworks[tokenId] = Artwork({
            creator: msg.sender,
            price: price_,
            metadataURI: metadataURI_
        });
    }

    function buyArtwork(uint256 tokenId) public payable {
        Artwork memory artwork = _artworks[tokenId];
        address ownerOfToken = ownerOf(tokenId);
        require(ownerOfToken != msg.sender, "Voce ja e o dono deste token.");
        require(msg.value >= artwork.price, "Valor enviado e insuficiente.");

        (address royaltyRecipient, uint256 royaltyAmount) = royaltyInfo(tokenId, artwork.price);
        
        payable(ownerOfToken).transfer(artwork.price - royaltyAmount);
        if (royaltyAmount > 0) {
            payable(royaltyRecipient).transfer(royaltyAmount);
        }

        _transfer(ownerOfToken, msg.sender, tokenId);

        if (msg.value > artwork.price) {
            payable(msg.sender).transfer(msg.value - artwork.price);
        }
    }

    function setPrice(uint256 tokenId, uint256 newPrice_) public {
        require(ownerOf(tokenId) == msg.sender, "Apenas o dono pode alterar o preco.");
        _artworks[tokenId].price = newPrice_;
    }

    // === FUNÇÕES DE LEITURA (Sem alterações) ===

    function getPrice(uint256 tokenId) public view returns (uint256) {
        return _artworks[tokenId].price;
    }

    function getCreator(uint256 tokenId) public view returns (address) {
        return _artworks[tokenId].creator;
    }

    // ===============================================
    // === OVERRIDES OBRIGATÓRIOS PARA OpenZeppelin v5.x ===
    // ===============================================

    /**
     * @dev Hook que é chamado antes de qualquer transferência de token.
     * Em OZ v5, _update substitui o papel do antigo _beforeTokenTransfer para
     * a lógica principal de transferência.
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Hook chamado para incrementar o balanço de um endereço.
     * Necessário para resolver o conflito entre ERC721 e ERC721Enumerable.
     */
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
    
    /**
     * @notice Sobrescreve a função tokenURI para usar nossa URI de metadados customizada.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721)
        returns (string memory)
    {
        _requireOwned(tokenId); // Helper da OZ que já verifica se o token existe.
        return string(abi.encodePacked("ipfs://", _artworks[tokenId].metadataURI));
    }

    /**
     * @notice Declara ao mundo quais interfaces (padrões) este contrato suporta.
     * Essencial para a interoperabilidade.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}