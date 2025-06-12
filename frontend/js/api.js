/**
 * Busca a lista de obras de arte da API do backend.
 * @returns {Promise<Array>} Uma promessa que resolve para a lista de obras.
 * @throws {Error} Lança um erro se a resposta da rede não for bem-sucedida.
 */
async function fetchArtworks() {
  const API_URL = "http://127.0.0.1:8000/api/artworks";

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      // Lança um erro com o código de status para ser tratado pelo chamador
      throw new Error(`Erro na rede: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Re-lança o erro para que o orquestrador (app.js) possa tratá-lo.
    console.error("Falha ao buscar obras da API:", error);
    throw error;
  }
}

/**
 * Busca as obras de arte de um dono específico.
 * @param {string} address - O endereço do dono.
 * @returns {Promise<Array>} Uma promessa que resolve para a lista de obras.
 */
async function fetchArtworksByOwner(address) {
  const API_URL = `http://127.0.0.1:8000/api/user/${address}/artworks`;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Erro na rede: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Falha ao buscar obras para o endereço ${address}:`, error);
    throw error;
  }
}

async function fetchUserArtworks(address) {
  const API_URL = `http://127.0.0.1:8000/api/user/${address}/artworks`;
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`Erro na API: ${response.statusText}`);
  }
  return await response.json();
}
