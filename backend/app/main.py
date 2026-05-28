from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title=f"{settings.app_name} API",
    description="Demo crowdfunding platform API working only in TEST MODE.",
    version="0.1.0",
    debug=settings.app_debug,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/")
def root() -> dict[str, str | bool]:
    return {
        "name": f"{settings.app_name} API",
        "mode": "TEST_MODE" if settings.test_mode else "LIVE_MODE",
        "test_mode": settings.test_mode,
        "status": "running",
    }
