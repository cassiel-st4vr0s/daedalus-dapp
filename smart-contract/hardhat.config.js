require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Carrega as variáveis de ambiente e verifica se elas existem.
const { SEPOLIA_RPC_URL, PRIVATE_KEY } = process.env;

if (!SEPOLIA_RPC_URL || !PRIVATE_KEY) {
  console.error(
    "ERRO: Certifique-se de que SEPOLIA_RPC_URL e PRIVATE_KEY estao definidos no seu arquivo .env"
  );
  process.exit(1);
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24", // Mantenha a versão do seu compilador
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};
