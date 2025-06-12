document.addEventListener("DOMContentLoaded", () => {
  const connectWalletPrompt = document.getElementById("connect-wallet-prompt");
  const galleryContainer = document.getElementById("gallery-container");
  const connectWalletButton = document.getElementById("connect-wallet-button");
  const walletInfoContainer = document.getElementById("wallet-info-container");

  let connectedAccount = null;

  /**
   * Busca as obras de um usuário e as renderiza.
   * @param {string} address - O endereço da carteira do usuário.
   */
  async function loadProfile(address) {
    // Mostra a galeria e esconde o prompt
    galleryContainer.style.display = "grid";
    connectWalletPrompt.style.display = "none";
    galleryContainer.innerHTML =
      '<p class="col-span-full text-center text-gray-400">Carregando suas obras...</p>';

    try {
      // Reutiliza a função fetchArtworks de api.js, mas com o novo endpoint
      const userArtworks = await fetchUserArtworks(address);

      // Reutiliza a função renderGallery de ui.js
      renderGallery(userArtworks);

      // Verifica se o resultado está vazio para mostrar a mensagem motivacional
      if (userArtworks.length === 0) {
        galleryContainer.innerHTML =
          '<p class="col-span-full text-center text-gray-400">Você ainda não possui nenhuma obra. <a href="/mint.html" class="text-teal-400 hover:underline">Crie sua primeira!</a></p>';
      }
    } catch (error) {
      // Reutiliza a função renderError de ui.js, mas no container da galeria
      renderErrorInContainer(
        galleryContainer,
        `Não foi possível carregar seu perfil. ${error.message}`
      );
    }
  }

  /**
   * Conecta a carteira e inicia o carregamento do perfil.
   */
  async function handleConnectWallet() {
    const isConnected = await connectWallet(); // Função do wallet.js
    if (isConnected) {
      connectedAccount = await signer.getAddress();
      updateWalletInfo(); // Atualiza o header
      loadProfile(connectedAccount);
    }
  }

  /**
   * Atualiza as informações da carteira no header.
   */
  function updateWalletInfo() {
    if (connectedAccount) {
      const truncatedAccount = `${connectedAccount.substring(
        0,
        6
      )}...${connectedAccount.substring(connectedAccount.length - 4)}`;
      // Cria os links do header
      walletInfoContainer.innerHTML = `
                <div class="flex items-center space-x-4">
                    <span class="text-sm font-mono">${truncatedAccount}</span>
                    <a href="/profile.html" class="text-white font-bold hover:text-teal-300">Meu Perfil</a>
                </div>
            `;
    }
  }

  // Adiciona o evento de clique ao botão de conectar
  connectWalletButton.addEventListener("click", handleConnectWallet);

  // Verifica se a carteira já está conectada ao carregar a página
  // (Útil se o usuário já conectou em outra aba/página)
  if (
    typeof window.ethereum !== "undefined" &&
    window.ethereum.selectedAddress
  ) {
    handleConnectWallet();
  }
});

// renderError que atue em um container específico
function renderErrorInContainer(container, message) {
  container.innerHTML = `<div class="col-span-full text-center text-red-500">
                               <h2 class="text-lg font-bold">Ocorreu um erro</h2>
                               <p>${message}</p>
                           </div>`;
}
