from fastapi import FastAPI

app = FastAPI(title="Daedalus DApp API")


@app.get("/")
def read_root():
    return {"Hello": "Daedalus"}
