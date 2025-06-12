/**
 * Função principal que é executada quando a página é carregada.
 */
const navLinksContainer = document.getElementById("nav-links-container");
let connectedAccount = null;

/**
 * Atualiza o header com base no estado de conexão da carteira.
 */
function updateHeader() {
  // Limpa links antigos (exceto o "Criar Obra") para evitar duplicação
  const dynamicLink = document.getElementById("dynamic-nav-link");
  if (dynamicLink) {
    dynamicLink.remove();
  }

  if (connectedAccount) {
    // Usuário está conectado: mostra endereço e link do perfil
    const truncatedAccount = `${connectedAccount.substring(
      0,
      6
    )}...${connectedAccount.substring(connectedAccount.length - 4)}`;

    const profileLink = document.createElement("div");
    profileLink.id = "dynamic-nav-link";
    profileLink.className = "flex items-center space-x-4";
    profileLink.innerHTML = `
            <span class="text-sm font-mono text-gray-300">${truncatedAccount}</span>
            <a href="/profile.html" class="text-white font-bold hover:text-teal-300">Meu Perfil</a>
        `;
    navLinksContainer.appendChild(profileLink);
  } else {
    // Usuário não está conectado: mostra botão de conectar
    const connectButton = document.createElement("div");
    connectButton.id = "dynamic-nav-link";
    connectButton.innerHTML = `
            <button id="connect-wallet-button" class="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition">
                Conectar
            </button>
        `;
    navLinksContainer.appendChild(connectButton);

    // Adiciona o listener ao botão que acabamos de criar
    document
      .getElementById("connect-wallet-button")
      .addEventListener("click", handleConnectWallet);
  }
}

/**
 * Manipula o fluxo de conexão da carteira.
 */
async function handleConnectWallet() {
  const isConnected = await connectWallet(); // Função do wallet.js
  if (isConnected) {
    connectedAccount = await signer.getAddress();
    updateHeader();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Tenta detectar uma carteira já conectada na inicialização
  if (
    typeof window.ethereum !== "undefined" &&
    window.ethereum.selectedAddress
  ) {
    connectedAccount = window.ethereum.selectedAddress;
  }
  updateHeader(); // Atualiza o header com o estado inicial

  try {
    const artworks = await fetchArtworks();
    renderGallery(artworks);
  } catch (error) {
    renderError(
      `Não foi possível carregar as obras. Código do erro: ${error.message}`
    );
  }
});
