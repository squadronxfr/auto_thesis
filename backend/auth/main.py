from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from routes.router import user_router
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ "*" ],
    allow_credentials= True ,
    allow_methods=[ "*" ],
    allow_headers=[ "*" ],
)

app.include_router(user_router, prefix= "/api/auth")