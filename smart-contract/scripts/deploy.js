const hre = require("hardhat");

async function main() {
  console.log("Iniciando o processo de deploy...");

  // Obtém o contrato a ser implantado
  const daedalusV2 = await hre.ethers.deployContract("DaedalusV2");

  // Aguarda a confirmação da transação na blockchain
  await daedalusV2.waitForDeployment();

  // Imprime o endereço do contrato implantado no console
  console.log(
    `Contrato DaedalusV2 implantado com sucesso no endereço: ${daedalusV2.target}`
  );
}

// Padrão recomendado para usar async/await em scripts e tratar erros.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
