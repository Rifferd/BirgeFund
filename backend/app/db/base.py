from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Imports below are needed so Alembic can detect SQLAlchemy models.
from app.modules.users import model as users_model  # noqa: E402,F401
from app.modules.auth import model as auth_model  # noqa: E402,F401
