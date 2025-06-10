import httpx
import os
from dotenv import load_dotenv
from fastapi import UploadFile, HTTPException
import json
from datetime import datetime, timezone

load_dotenv()

PINATA_API_KEY = os.getenv("PINATA_API_KEY")
PINATA_API_SECRET = os.getenv("PINATA_API_SECRET")
PINATA_API_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"


async def upload_to_ipfs(
    file: UploadFile, name: str, description: str, price: str, creator_address: str
) -> str:
    """
    Upload do arquivo e do metadado JSON para o IPFS via Pinata.
    Retorna o CID (hash) do metadado JSON.
    """
    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_API_SECRET,
    }

    # Faz o upload do arquivo de imagem
    files = {"file": (file.filename, await file.read(), file.content_type)}
    image_cid = await _pin_file_to_ipfs(headers, files)

    # Cria o arquivo de metadados JSON com a sua estrutura
    metadata = {
        "name": name,
        "description": description,
        "image": f"ipfs://{image_cid}",
        "attributes": [
            {"trait_type": "Creator", "value": creator_address},
            {"trait_type": "Category", "value": "Digital Art"},
            {"trait_type": "Price", "value": f"{price} ETH"},
        ],
        "created_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }

    # Converte o dicionário de metadados para uma string JSON e depois para bytes
    metadata_bytes = json.dumps(metadata).encode("utf-8")

    # Prepara os dados para o upload do JSON
    metadata_files = {"file": ("metadata.json", metadata_bytes, "application/json")}

    # Faz o upload do arquivo JSON de metadados
    metadata_cid = await _pin_file_to_ipfs(headers, metadata_files)

    return metadata_cid


async def _pin_file_to_ipfs(headers: dict, files: dict) -> str:
    """Função auxiliar para fazer o upload de um arquivo para o Pinata."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(PINATA_API_URL, headers=headers, files=files)

        response.raise_for_status()  # Lança um erro para respostas 4xx ou 5xx

        data = response.json()
        return data["IpfsHash"]

    except httpx.HTTPStatusError as e:
        print(f"Erro na API do Pinata: {e.response.text}")
        raise HTTPException(
            status_code=503, detail="Falha no serviço de armazenamento IPFS."
        )
    except Exception as e:
        print(f"Erro inesperado no upload para IPFS: {e}")
        raise HTTPException(
            status_code=500, detail="Erro interno ao processar o upload."
        )
