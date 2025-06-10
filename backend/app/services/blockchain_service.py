import os
import json
from web3 import Web3
from dotenv import load_dotenv
import httpx

load_dotenv()

# configurações do ambiente
SEPOLIA_RPC_URL = os.getenv("ETHEREUM_RPC_URL")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")

# Validate environment variables
if not SEPOLIA_RPC_URL:
    raise ValueError("ETHEREUM_RPC_URL environment variable is not set")

if not CONTRACT_ADDRESS:
    raise ValueError("CONTRACT_ADDRESS environment variable is not set")

# Carrega a ABI
with open("app/core/DaedalusV2_ABI.json", "r") as f:
    CONTRACT_ABI = json.load(f)

# Conecta ao nó da blockchain
w3 = Web3(Web3.HTTPProvider(SEPOLIA_RPC_URL))

if not w3.is_connected():
    raise ConnectionError("Falha ao conectar ao no Ethereum")

# Converte o endereço para o formato checksum antes de usá-lo
checksum_contract_address = w3.to_checksum_address(CONTRACT_ADDRESS)

# Cria a instância do contrato usando o endereço checksumado
contract = w3.eth.contract(address=checksum_contract_address, abi=CONTRACT_ABI)

metadata_cache = {}


def get_all_artworks():
    """
    Busca todos os NFTs e seus metadados do IPFS.
    """
    try:
        total_supply = contract.functions.totalSupply().call()
        artworks_list = []
        for i in range(1, total_supply + 1):
            # Usamos a função de buscar por ID para evitar duplicação de código
            artwork_details = get_artwork_by_id(i)
            if artwork_details:
                artworks_list.append(artwork_details)
        return artworks_list
    except Exception as e:
        print(f"Erro ao buscar todos os artworks: {e}")
        return []


def get_artwork_by_id(token_id: int):
    """
    Busca os dados de um único NFT, utilizando um cache para os metadados do IPFS.
    """
    try:
        owner = contract.functions.ownerOf(token_id).call()

        # 1. VERIFICA O CACHE PRIMEIRO
        if token_id in metadata_cache:
            print(f"INFO: Metadados para o token {token_id} encontrados no cache.")
            return _format_artwork_data(token_id, metadata_cache[token_id], owner)

        # 2. SE NÃO ESTÁ NO CACHE, BUSCA DO IPFS
        metadata_hash = (
            contract.functions.tokenURI(token_id).call().replace("ipfs://", "")
        )
        if not metadata_hash:
            return None

        ipfs_url = (
            f"https://moccasin-calm-butterfly-250.mypinata.cloud/ipfs/{metadata_hash}"
        )
        with httpx.Client(timeout=10.0) as client:
            response = client.get(ipfs_url)
            response.raise_for_status()
            metadata = response.json()

            # Armazena os metadados no cache para uso futuro
            metadata_cache[token_id] = metadata
            print(
                f"INFO: Metadados para o token {token_id} buscados do IPFS e cacheados."
            )

            return _format_artwork_data(token_id, metadata, owner)

    except Exception as e:
        print(f"AVISO: Falha ao processar o token {token_id}: {e}")
        return None


def _format_artwork_data(token_id: int, metadata: dict, owner_address: str):
    """
    Função auxiliar para formatar os dados da obra.
    Busca os dados on-chain restantes (preço, dono, etc.).
    """
    try:
        creator = contract.functions.getCreator(token_id).call()
        price_in_wei = contract.functions.getPrice(token_id).call()

        return {
            "token_id": token_id,
            "name": metadata.get("name", f"Obra #{token_id}"),
            "image_url": metadata.get("image", "").replace(
                "ipfs://", "https://moccasin-calm-butterfly-250.mypinata.cloud/ipfs/"
            ),
            "price": float(w3.from_wei(price_in_wei, "ether")),
            "creator": creator,
            "owner": owner_address,
            "is_for_sale": True,
        }
    except Exception as e:
        print(f"Erro ao formatar os dados para o token {token_id}: {e}")
        return None
