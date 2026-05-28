from fastapi import APIRouter

from app.api.v1.endpoints.debug import router as debug_router
from app.api.v1.endpoints.health import router as health_router
from app.modules.categories.router import router as categories_router
from app.modules.projects.router import router as projects_router
from app.modules.rewards.router import router as rewards_router
from app.modules.auth.router import router as auth_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(categories_router)
api_router.include_router(projects_router)
api_router.include_router(rewards_router)
api_router.include_router(debug_router)
