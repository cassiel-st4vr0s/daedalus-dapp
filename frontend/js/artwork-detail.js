/**
 * Busca os detalhes de uma única obra de arte pela API.
 * @param {string} tokenId - O ID do token a ser buscado.
 * @returns {Promise<object>} Uma promessa que resolve para o objeto da obra.
 */
async function fetchArtworkDetails(tokenId) {
  const API_URL = `http://127.0.0.1:8000/api/artworks/${tokenId}`;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Falha ao buscar detalhes para o token ${tokenId}:`, error);
    throw error;
  }
}

/**
 * Renderiza os detalhes da obra no DOM.
 * @param {object} artwork - O objeto da obra de arte.
 */
function renderArtworkDetails(artwork) {
  const container = document.getElementById("artwork-detail-container");

  // Limpa as mensagens de carregamento/erro
  container.innerHTML = "";

  const truncatedCreator = `${artwork.creator.substring(
    0,
    6
  )}...${artwork.creator.substring(artwork.creator.length - 4)}`;
  const truncatedOwner = `${artwork.owner.substring(
    0,
    6
  )}...${artwork.owner.substring(artwork.owner.length - 4)}`;

  const detailElement = document.createElement("div");
  detailElement.className = "grid grid-cols-1 md:grid-cols-2 gap-8 items-start";

  detailElement.innerHTML = `
    <!-- Coluna da Imagem -->
    <div>
      <img src="${artwork.image_url}" alt="${
    artwork.name
  }" class="w-full rounded-lg shadow-2xl">
    </div>

    <!-- Coluna de Informações -->
    <div class="space-y-4">
      <h1 class="text-4xl font-bold">${artwork.name}</h1>
      
      <div class="text-lg text-gray-300">
        <p><span class="font-semibold">Criador:</span> ${truncatedCreator}</p>
        <p><span class="font-semibold">Dono Atual:</span> ${truncatedOwner}</p>
      </div>

      <div class="bg-gray-800 p-4 rounded-lg">
        <p class="text-sm text-gray-400">Preço Atual</p>
        <p class="text-3xl font-bold text-teal-400">${artwork.price} ETH</p>
      </div>

      ${
        artwork.is_for_sale
          ? '<button id="buy-button" class="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">Comprar Agora</button>'
          : '<div class="w-full bg-red-800 text-white font-bold py-3 px-4 rounded-lg text-center">Esta obra não está à venda</div>'
      }
    </div>
  `;
  container.appendChild(detailElement);
}

/**
 * Renderiza uma mensagem de erro na página.
 * @param {string} message - A mensagem de erro.
 */
function renderError(message) {
  const container = document.getElementById("artwork-detail-container");
  container.innerHTML = `<div class="text-center text-red-500">
                            <h2 class="text-2xl font-bold">Erro</h2>
                            <p>${message}</p>
                         </div>`;
}

/**
 * Adiciona o listener de evento ao botão de compra.
 * @param {string} tokenId
 * @param {number} price
 */
function addBuyButtonListener(tokenId, price) {
  const buyButton = document.getElementById("buy-button");
  if (buyButton) {
    buyButton.addEventListener("click", async () => {
      // Desabilita o botão para evitar cliques duplos
      buyButton.disabled = true;
      buyButton.textContent = "Processando...";
      buyButton.classList.add("opacity-50", "cursor-not-allowed");

      try {
        await connectWallet(); // Garante que a carteira está conectada

        const tx = await purchaseArtwork(tokenId, price);

        buyButton.textContent = "Aguardando Confirmação...";

        // Aguarda a transação ser minerada e confirmada na blockchain
        await tx.wait();

        buyButton.textContent = "Compra Realizada com Sucesso!";
        buyButton.classList.remove("bg-teal-500", "hover:bg-teal-600");
        buyButton.classList.add("bg-green-600");

        // Opcional: Recarregar a página para mostrar o novo dono
        alert("Parabéns! A obra é sua. A página será recarregada.");
        window.location.reload();
      } catch (error) {
        console.error("O processo de compra falhou.", error);
        // Reabilita o botão em caso de falha
        buyButton.disabled = false;
        buyButton.textContent = "Comprar Agora";
        buyButton.classList.remove("opacity-50", "cursor-not-allowed");
      }
    });
  }
}

/**
 * Ponto de entrada: executado quando a página de detalhes é carregada.
 */
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const tokenId = params.get("id");

  if (!tokenId) {
    renderError("ID da obra não encontrado na URL.");
    return;
  }

  try {
    const artwork = await fetchArtworkDetails(tokenId);
    renderArtworkDetails(artwork);

    // Adiciona o listener de evento AO BOTÃO após renderizar os detalhes
    if (artwork.is_for_sale) {
      addBuyButtonListener(artwork.token_id, artwork.price);
    }
  } catch (error) {
    renderError(
      `Não foi possível carregar os detalhes da obra. ${error.message}`
    );
  }
});
