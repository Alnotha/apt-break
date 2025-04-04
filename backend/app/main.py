import sentry_sdk
from fastapi import FastAPI
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware
import aiohttp
from app.api.main import api_router
from app.core.config import settings


def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

# ✅ Fallback if .env doesn't parse BACKEND_CORS_ORIGINS properly
default_cors_origins = [
    "http://localhost:5173",  # dev
    "https://apt-break-frontend.vercel.app",  # vercel deployed frontend
    "https://www.aptbreak.com"  # custom domain
]

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.all_cors_origins or default_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    app.state.http_client = aiohttp.ClientSession()

@app.on_event("shutdown")
async def shutdown_db_client():
    await app.state.http_client.close()

app.include_router(api_router, prefix=settings.API_V1_STR)
