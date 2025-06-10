from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import artworks

# Instancia o FastAPI
app = FastAPI(
    title="Daedalus DApp API",
    description="API para servir dados do DApp Daedalus, interagindo com a blockchain e IPFS.",
    version="0.1.0",
)

# Configuração do CORS
# Define as origens (URLs) que têm permissão para acessar esta API.
origins = [
    # A URL padrão do live-server que o frontend usa
    "http://127.0.0.1:3000",
    "http://localhost:3000",  # Adicionado por segurança, às vezes o live-server usa localhost
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos
    allow_headers=["*"],  # Permite todos os cabeçalhos
)

# Inclusão das Rotas da API
# Inclui as rotas definidas no arquivo artworks.py, com um prefixo.
app.include_router(artworks.router, prefix="/api")


# Rota raiz para uma verificação de saúde simples
@app.get("/", tags=["Root"])
def read_root():
    return {"status": "ok", "message": "Bem-vindo a API do Daedalus DApp"}
