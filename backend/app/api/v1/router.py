from fastapi import APIRouter

from app.api.v1.endpoints.debug import router as debug_router
from app.api.v1.endpoints.health import router as health_router
from app.modules.categories.router import router as categories_router
from app.modules.projects.router import router as projects_router
from app.modules.rewards.router import router as rewards_router
from app.modules.reports.router import router as reports_router
from app.modules.files.router import router as files_router
from app.modules.payments.router import router as payments_router
from app.modules.ledger.router import router as ledger_router
from app.modules.refunds.router import router as refunds_router
from app.modules.comments.router import router as comments_router
from app.modules.complaints.router import router as complaints_router
from app.modules.notifications.router import router as notifications_router
from app.modules.admin.router import router as admin_router
from app.modules.cms.router import router as cms_router
from app.modules.cms.admin_router import router as admin_cms_router
from app.modules.banners.router import router as banners_router
from app.modules.banners.admin_router import router as admin_banners_router
from app.modules.translations.router import router as translations_router
from app.modules.translations.admin_router import router as admin_translations_router
from app.modules.auth.router import router as auth_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(categories_router)
api_router.include_router(projects_router)
api_router.include_router(rewards_router)
api_router.include_router(reports_router)
api_router.include_router(files_router)
api_router.include_router(payments_router)
api_router.include_router(ledger_router)
api_router.include_router(refunds_router)
api_router.include_router(comments_router)
api_router.include_router(complaints_router)
api_router.include_router(notifications_router)
api_router.include_router(admin_router)
api_router.include_router(cms_router)
api_router.include_router(admin_cms_router)
api_router.include_router(banners_router)
api_router.include_router(admin_banners_router)
api_router.include_router(translations_router)
api_router.include_router(admin_translations_router)
api_router.include_router(debug_router)
