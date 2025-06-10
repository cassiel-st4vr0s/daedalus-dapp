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
 * Ponto de entrada: executado quando a página de detalhes é carregada.
 */
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Pega o ID do token da URL (ex: artwork.html?id=1)
  const params = new URLSearchParams(window.location.search);
  const tokenId = params.get("id");

  if (!tokenId) {
    renderError("ID da obra não encontrado na URL.");
    return;
  }

  // 2. Busca os dados da obra específica
  try {
    const artwork = await fetchArtworkDetails(tokenId);
    // 3. Renderiza os detalhes na página
    renderArtworkDetails(artwork);
  } catch (error) {
    // 4. Se falhar, exibe uma mensagem de erro
    renderError(
      `Não foi possível carregar os detalhes da obra. ${error.message}`
    );
  }
});
