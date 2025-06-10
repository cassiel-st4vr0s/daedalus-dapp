# app/api/artworks.py
from typing import List
from fastapi import APIRouter, HTTPException
from app.schemas.artwork import Artwork


router = APIRouter()

# Dados mockados para simular o retorno da blockchain
mock_artworks_data = [
    {
        "token_id": 1,
        "name": "Cosmic Dream",
        "image_url": "https://gateway.pinata.cloud/ipfs/QmZgA2C4H3r5B6F7G8H9J0K1L2M3N4P5Q6R7S8T9U0V",
        "price": 0.01,
        "creator": "0xCreatorAddress1",
        "owner": "0xOwnerAddress1",
        "is_for_sale": True,
    },
    {
        "token_id": 2,
        "name": "Digital Renaissance",
        "image_url": "https://gateway.pinata.cloud/ipfs/QmT9U0V1W2X3Y4Z5A6B7C8D9E0F1G2H3J4K5L6M7",
        "price": 0.75,
        "creator": "0xCreatorAddress2",
        "owner": "0xOwnerAddress2",
        "is_for_sale": False,  # Este item já foi "vendido"
    },
]


@router.get("/artworks", response_model=List[Artwork], tags=["Artworks"])
def get_artworks():
    """
    Endpoint para listar todas as obras de arte (atualmente com dados mocados).
    """
    return mock_artworks_data


@router.get("/artworks/{token_id}", response_model=Artwork, tags=["Artworks"])
def get_artwork_details(token_id: int):
    """
    Endpoint para obter os detalhes de uma única obra de arte.
    """
    # Procura na nossa lista mocada pela obra com o token_id correspondente
    artwork = next(
        (item for item in mock_artworks_data if item["token_id"] == token_id), None
    )

    if artwork is None:
        # Se a obra não for encontrada, lança uma exceção HTTP 404
        raise HTTPException(status_code=404, detail="Obra de arte não encontrada")

    return artwork
