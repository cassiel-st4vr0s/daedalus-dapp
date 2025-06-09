import { expect } from "chai";
import { ethers } from "hardhat";

describe("DaedalusV2", function () {
  let daedalusV2;
  let owner;
  let creator;
  let buyer;
  let other;

  const ARTWORK_PRICE = ethers.parseEther("1.0"); // 1 ETH
  const METADATA_URI = "QmTestHashForIPFS";
  const ROYALTY_PERCENTAGE = 500; // 5%

  beforeEach(async function () {
    // Obtém contas de teste
    [owner, creator, buyer, other] = await ethers.getSigners();

    // Deploy do contrato
    const DaedalusV2 = await ethers.getContractFactory("DaedalusV2");
    daedalusV2 = await DaedalusV2.deploy();
    await daedalusV2.waitForDeployment();
  });

  describe("Deploy", function () {
    it("Deve ser implantado com o nome e símbolo corretos", async function () {
      expect(await daedalusV2.name()).to.equal("Daedalus Artwork");
      expect(await daedalusV2.symbol()).to.equal("DAED");
    });

    it("Deve definir o owner correto", async function () {
      expect(await daedalusV2.owner()).to.equal(owner.address);
    });

    it("Deve definir royalties padrão de 5%", async function () {
      const [recipient, amount] = await daedalusV2.royaltyInfo(
        1,
        ethers.parseEther("1.0")
      );
      expect(recipient).to.equal(owner.address);
      expect(amount).to.equal(ethers.parseEther("0.05")); // 5% de 1 ETH
    });

    it("Deve começar com totalSupply zero", async function () {
      expect(await daedalusV2.totalSupply()).to.equal(0);
    });
  });

  describe("Minting (mintArtwork)", function () {
    it("Deve permitir que um usuário minte um novo NFT", async function () {
      await expect(
        daedalusV2.connect(creator).mintArtwork(METADATA_URI, ARTWORK_PRICE)
      ).to.not.be.reverted;
    });

    it("Deve atribuir o NFT ao endereço correto", async function () {
      await daedalusV2
        .connect(creator)
        .mintArtwork(METADATA_URI, ARTWORK_PRICE);

      expect(await daedalusV2.ownerOf(1)).to.equal(creator.address);
      expect(await daedalusV2.balanceOf(creator.address)).to.equal(1);
    });

    it("Deve armazenar preço e criador corretamente", async function () {
      await daedalusV2
        .connect(creator)
        .mintArtwork(METADATA_URI, ARTWORK_PRICE);

      expect(await daedalusV2.getPrice(1)).to.equal(ARTWORK_PRICE);
      expect(await daedalusV2.getCreator(1)).to.equal(creator.address);
    });

    it("Deve incrementar o totalSupply", async function () {
      await daedalusV2
        .connect(creator)
        .mintArtwork(METADATA_URI, ARTWORK_PRICE);
      expect(await daedalusV2.totalSupply()).to.equal(1);

      await daedalusV2.connect(other).mintArtwork(METADATA_URI, ARTWORK_PRICE);
      expect(await daedalusV2.totalSupply()).to.equal(2);
    });

    it("Deve retornar a URI correta do token", async function () {
      await daedalusV2
        .connect(creator)
        .mintArtwork(METADATA_URI, ARTWORK_PRICE);

      const tokenURI = await daedalusV2.tokenURI(1);
      expect(tokenURI).to.equal(`ipfs://${METADATA_URI}`);
    });

    it("Deve mintar tokens com IDs sequenciais", async function () {
      await daedalusV2
        .connect(creator)
        .mintArtwork(METADATA_URI, ARTWORK_PRICE);
      await daedalusV2.connect(other).mintArtwork(METADATA_URI, ARTWORK_PRICE);

      expect(await daedalusV2.ownerOf(1)).to.equal(creator.address);
      expect(await daedalusV2.ownerOf(2)).to.equal(other.address);
    });
  });

  describe("Preço (setPrice)", function () {
    beforeEach(async function () {
      await daedalusV2
        .connect(creator)
        .mintArtwork(METADATA_URI, ARTWORK_PRICE);
    });

    it("Deve permitir que o dono altere o preço", async function () {
      const newPrice = ethers.parseEther("2.0");

      await expect(daedalusV2.connect(creator).setPrice(1, newPrice)).to.not.be
        .reverted;

      expect(await daedalusV2.getPrice(1)).to.equal(newPrice);
    });

    it("Deve falhar se usuário não-dono tentar alterar o preço", async function () {
      const newPrice = ethers.parseEther("2.0");

      await expect(
        daedalusV2.connect(buyer).setPrice(1, newPrice)
      ).to.be.revertedWith("Apenas o dono pode alterar o preco.");
    });

    it("Deve falhar ao tentar alterar preço de token inexistente", async function () {
      const newPrice = ethers.parseEther("2.0");

      await expect(daedalusV2.connect(creator).setPrice(999, newPrice)).to.be
        .reverted;
    });
  });

  describe("Compra (buyArtwork)", function () {
    beforeEach(async function () {
      await daedalusV2
        .connect(creator)
        .mintArtwork(METADATA_URI, ARTWORK_PRICE);
    });

    it("Deve transferir a propriedade para o comprador", async function () {
      await daedalusV2.connect(buyer).buyArtwork(1, { value: ARTWORK_PRICE });

      expect(await daedalusV2.ownerOf(1)).to.equal(buyer.address);
      expect(await daedalusV2.balanceOf(creator.address)).to.equal(0);
      expect(await daedalusV2.balanceOf(buyer.address)).to.equal(1);
    });

    it("Deve pagar vendedor e royalty corretamente", async function () {
      const creatorBalanceBefore = await ethers.provider.getBalance(
        creator.address
      );
      const ownerBalanceBefore = await ethers.provider.getBalance(
        owner.address
      );

      const expectedRoyalty =
        (ARTWORK_PRICE * BigInt(ROYALTY_PERCENTAGE)) / BigInt(10000);
      const expectedSellerPayment = ARTWORK_PRICE - expectedRoyalty;

      await daedalusV2.connect(buyer).buyArtwork(1, { value: ARTWORK_PRICE });

      const creatorBalanceAfter = await ethers.provider.getBalance(
        creator.address
      );
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(
        expectedSellerPayment
      );
      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(expectedRoyalty);
    });

    it("Deve devolver troco se enviado valor maior", async function () {
      const overpayment = ethers.parseEther("1.5");
      const buyerBalanceBefore = await ethers.provider.getBalance(
        buyer.address
      );

      const tx = await daedalusV2
        .connect(buyer)
        .buyArtwork(1, { value: overpayment });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
      const expectedBalanceAfter = buyerBalanceBefore - ARTWORK_PRICE - gasUsed;

      expect(buyerBalanceAfter).to.equal(expectedBalanceAfter);
    });

    it("Deve falhar se valor enviado for insuficiente", async function () {
      const insufficientValue = ethers.parseEther("0.5");

      await expect(
        daedalusV2.connect(buyer).buyArtwork(1, { value: insufficientValue })
      ).to.be.revertedWith("Valor enviado e insuficiente.");
    });

    it("Deve falhar se o comprador já for o dono", async function () {
      await expect(
        daedalusV2.connect(creator).buyArtwork(1, { value: ARTWORK_PRICE })
      ).to.be.revertedWith("Voce ja e o dono deste token.");
    });

    it("Deve falhar ao tentar comprar token inexistente", async function () {
      await expect(
        daedalusV2.connect(buyer).buyArtwork(999, { value: ARTWORK_PRICE })
      ).to.be.reverted;
    });

    it("Deve permitir revenda do NFT", async function () {
      // Primeira compra
      await daedalusV2.connect(buyer).buyArtwork(1, { value: ARTWORK_PRICE });

      // Novo dono altera o preço
      const newPrice = ethers.parseEther("2.0");
      await daedalusV2.connect(buyer).setPrice(1, newPrice);

      // Outro usuário compra
      await daedalusV2.connect(other).buyArtwork(1, { value: newPrice });

      expect(await daedalusV2.ownerOf(1)).to.equal(other.address);
    });
  });

  describe("Interfaces e Compatibilidade", function () {
    it("Deve suportar interfaces ERC721, ERC721Enumerable e ERC2981", async function () {
      // ERC721
      expect(await daedalusV2.supportsInterface("0x80ac58cd")).to.be.true;
      // ERC721Enumerable
      expect(await daedalusV2.supportsInterface("0x780e9d63")).to.be.true;
      // ERC2981 (Royalties)
      expect(await daedalusV2.supportsInterface("0x2a55205a")).to.be.true;
    });
  });

  describe("Cenários de Edge Cases", function () {
    it("Deve falhar ao consultar tokenURI de token inexistente", async function () {
      await expect(daedalusV2.tokenURI(999)).to.be.reverted;
    });

    it("Deve permitir preço zero", async function () {
      await daedalusV2.connect(creator).mintArtwork(METADATA_URI, 0);
      expect(await daedalusV2.getPrice(1)).to.equal(0);

      await daedalusV2.connect(buyer).buyArtwork(1, { value: 0 });
      expect(await daedalusV2.ownerOf(1)).to.equal(buyer.address);
    });
  });
});
