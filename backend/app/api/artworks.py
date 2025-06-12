from typing import List
from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from app.schemas.artwork import Artwork
from app.services import ipfs_service
from app.services import blockchain_service

router = APIRouter()


@router.get("/artworks", response_model=List[Artwork], tags=["Artworks"])
def get_artworks():
    """
    Endpoint para listar todas as obras de arte, buscando dados da blockchain.
    """
    artworks_from_chain = blockchain_service.get_all_artworks()
    return artworks_from_chain


@router.get("/artworks/{token_id}", response_model=Artwork, tags=["Artworks"])
def get_artwork_details(token_id: int):
    """
    Endpoint para obter os detalhes de uma única obra de arte, buscando da blockchain.
    """
    artwork = blockchain_service.get_artwork_by_id(token_id)

    if artwork is None:
        # O serviço retorna None se o token não for encontrado
        raise HTTPException(status_code=404, detail="Obra de arte não encontrada")

    return artwork


@router.post("/artworks", status_code=201, tags=["Artworks"])
async def create_artwork(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: str = Form(...),
    price: str = Form(...),
    # Obs: No sistema definitivo, o endereço do criador viria de um token de autenticação.
    # Mas no MVP vamos simular isso, o frontend deve enviar o endereço do usuário conectado.
    creator_address: str = Form(...),
):
    """
    Endpoint para criar uma nova obra: faz o upload do arquivo e metadados para o IPFS.
    Retorna a URI dos metadados para ser usada na transação de mint.
    """
    metadata_uri = await ipfs_service.upload_to_ipfs(
        file=file,
        name=name,
        description=description,
        price=price,
        creator_address=creator_address,
    )
    return {"metadata_uri": metadata_uri}


@router.get("/user/{address}/artworks", response_model=List[Artwork], tags=["User"])
def get_user_artworks(address: str):
    """
    Endpoint para listar todas as obras de arte pertencentes a um endereço específico.
    """
    artworks = blockchain_service.get_artworks_by_owner(address)
    return artworks
