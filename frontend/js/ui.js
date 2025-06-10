/**
 * Renderiza a galeria de obras de arte no DOM.
 * @param {Array} artworks - A lista de objetos de obras de arte.
 */
function renderGallery(artworks) {
  const galleryContainer = document.getElementById("gallery-container");
  const loadingMessage = document.getElementById("loading-message");

  // Limpa a mensagem de carregamento e o conteúdo anterior
  if (loadingMessage) {
    loadingMessage.remove();
  }
  galleryContainer.innerHTML = "";

  if (artworks.length === 0) {
    galleryContainer.innerHTML =
      '<p class="col-span-full text-center text-gray-400">Nenhuma obra encontrada.</p>';
    return;
  }

  artworks.forEach((artwork) => {
    const card = createArtworkCard(artwork);
    galleryContainer.appendChild(card);
  });
}

/**
 * Cria um único card HTML para uma obra de arte.
 * @param {object} artwork - O objeto da obra de arte.
 * @returns {HTMLElement} O elemento do card criado.
 */
function createArtworkCard(artwork) {
  const card = document.createElement("a"); // 'a' para ser clicável
  card.href = `artwork.html?id=${artwork.token_id}`;
  card.className =
    "bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300";

  // Trunca o endereço do dono para exibição
  const truncatedOwner = `${artwork.owner.substring(
    0,
    6
  )}...${artwork.owner.substring(artwork.owner.length - 4)}`;

  const isForSaleClass = artwork.is_for_sale ? "" : "opacity-60";

  card.innerHTML = `
    <div class="relative">
      <img src="${artwork.image_url}" alt="${
    artwork.name
  }" class="w-full h-56 object-cover ${isForSaleClass}">
      ${
        !artwork.is_for_sale
          ? '<div class="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">Vendido</div>'
          : ""
      }
    </div>
    <div class="p-4">
      <h3 class="text-lg font-bold truncate">${artwork.name}</h3>
      <p class="text-sm text-gray-400 mt-1">Dono: ${truncatedOwner}</p>
      <p class="text-lg font-semibold text-teal-400 mt-2">${
        artwork.price
      } ETH</p>
    </div>
  `;
  return card;
}

/**
 * Renderiza uma mensagem de erro no container de erro.
 * @param {string} message - A mensagem de erro a ser exibida.
 */
function renderError(message) {
  const galleryContainer = document.getElementById("gallery-container");
  const errorContainer = document.getElementById("error-container");

  // Limpa a galeria e a mensagem de carregamento
  galleryContainer.innerHTML = "";

  errorContainer.innerHTML = `
    <h2 class="text-2xl font-bold mb-2">Ocorreu um erro</h2>
    <p>${message}</p>
  `;
}
