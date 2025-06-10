# app/schemas/artwork.py
from pydantic import BaseModel


class Artwork(BaseModel):
    """
    Schema Pydantic para representar uma obra de arte na resposta da API.
    """

    token_id: int
    name: str
    image_url: str
    price: float  # Preço em ETH, não em wei
    creator: str
    owner: str
    is_for_sale: bool

    # Configuração para permitir que o Pydantic funcione bem com modelos de ORM/objetos
    class Config:
        from_attributes = True
