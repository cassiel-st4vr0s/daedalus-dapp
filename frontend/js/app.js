/**
 * Função principal que é executada quando a página é carregada.
 */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1. Busca os dados da API
    const artworks = await fetchArtworks();

    // 2. Renderiza a galeria com os dados obtidos
    renderGallery(artworks);
  } catch (error) {
    // 3. Se a busca falhar, renderiza uma mensagem de erro
    renderError(
      `Não foi possível carregar as obras. Código do erro: ${error.message}`
    );
  }
});
