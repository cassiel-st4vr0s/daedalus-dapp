document.addEventListener("DOMContentLoaded", () => {
  // Elementos do DOM
  const mintForm = document.getElementById("mint-form");
  const connectWalletPrompt = document.getElementById("connect-wallet-prompt");
  const connectWalletButton = document.getElementById("connect-wallet-button");
  const fileInput = document.getElementById("file");
  const imagePreviewContainer = document.getElementById(
    "image-preview-container"
  );
  const imagePreview = document.getElementById("image-preview");
  const submitButton = document.getElementById("submit-mint-button");
  const feedbackContainer = document.getElementById("feedback-container");
  const walletInfoDiv = document.getElementById("wallet-info");

  let connectedAccount = null;

  // Funções de UI

  function updateUIForWalletState() {
    if (connectedAccount) {
      mintForm.style.display = "block";
      connectWalletPrompt.style.display = "none";
      walletInfoDiv.innerHTML = `<p class="text-sm text-gray-300">Conectado: <span class="font-mono">${connectedAccount.substring(
        0,
        6
      )}...${connectedAccount.substring(
        connectedAccount.length - 4
      )}</span></p>`;
    } else {
      mintForm.style.display = "none";
      connectWalletPrompt.style.display = "block";
      walletInfoDiv.innerHTML = "";
    }
  }

  function setFeedback(message, isError = false) {
    feedbackContainer.innerHTML = `<p class="p-4 rounded-lg ${
      isError ? "bg-red-900/50 text-red-300" : "bg-blue-900/50 text-blue-300"
    }">${message}</p>`;
  }

  function clearFeedback() {
    feedbackContainer.innerHTML = "";
  }

  function setButtonState(disabled, text) {
    submitButton.disabled = disabled;
    submitButton.textContent = text;
    submitButton.classList.toggle("opacity-50", disabled);
    submitButton.classList.toggle("cursor-not-allowed", disabled);
  }

  // Lógica de Conexão

  async function handleConnectWallet() {
    const isConnected = await connectWallet();
    if (isConnected) {
      connectedAccount = await signer.getAddress();
      updateUIForWalletState();
    }
  }

  // Lógica do Formulário

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreviewContainer.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      imagePreviewContainer.style.display = "none";
    }
  });

  mintForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFeedback();
    setButtonState(true, "Iniciando...");

    const formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append(
      "description",
      document.getElementById("description").value
    );
    formData.append("price", document.getElementById("price").value);
    formData.append("file", fileInput.files[0]);
    formData.append("creator_address", connectedAccount);

    try {
      // 1. Upload para o backend/IPFS
      setButtonState(true, "Fazendo upload...");
      const response = await fetch("http://127.0.0.1:8000/api/artworks", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Falha no upload: ${response.statusText}`);
      }
      const data = await response.json();
      const metadataURI = data.metadata_uri;

      // 2. Transação de Mint na Blockchain
      setButtonState(true, "Aguardando assinatura...");
      const tx = await mintNFT(
        metadataURI,
        document.getElementById("price").value
      );

      setButtonState(true, "Processando na blockchain...");
      await tx.wait(); // Aguarda a confirmação da transação

      // 3. Sucesso
      setButtonState(false, "Criar NFT");
      mintForm.reset();
      imagePreviewContainer.style.display = "none";
      setFeedback(
        `NFT criado com sucesso! <a href="https://sepolia.etherscan.io/tx/${tx.hash}" target="_blank" class="underline hover:text-teal-400">Ver transação</a>`,
        false
      );
    } catch (error) {
      console.error("Processo de mint falhou:", error);
      setFeedback(`Erro: ${error.message}`, true);
      setButtonState(false, "Criar NFT");
    }
  });

  // Ponto de Entrada

  connectWalletButton.addEventListener("click", handleConnectWallet);

  // Verifica o estado inicial da carteira ao carregar a página
  if (
    typeof window.ethereum !== "undefined" &&
    window.ethereum.selectedAddress
  ) {
    handleConnectWallet();
  } else {
    updateUIForWalletState();
  }
});
