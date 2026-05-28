from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Imports below are needed so Alembic can detect SQLAlchemy models.
from app.modules.users import model as users_model  # noqa: E402,F401
from app.modules.auth import model as auth_model  # noqa: E402,F401
from app.modules.roles import model as roles_model  # noqa: E402,F401
from app.modules.projects import model as projects_model  # noqa: E402,F401
from app.modules.categories import model as categories_model  # noqa: E402,F401
from app.modules.audit import model as audit_model  # noqa: E402,F401
from app.modules.rewards import model as rewards_model  # noqa: E402,F401
from app.modules.reports import model as reports_model  # noqa: E402,F401
from app.modules.files import model as files_model  # noqa: E402,F401
from app.modules.payments import model as payments_model  # noqa: E402,F401
from app.modules.ledger import model as ledger_model  # noqa: E402,F401
from app.modules.refunds import model as refunds_model  # noqa: E402,F401
