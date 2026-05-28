from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.auth.model import RefreshToken


class RefreshTokenRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(
        self,
        *,
        user_id: int,
        token_hash: str,
        expires_at: datetime,
    ) -> RefreshToken:
        refresh_token = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
        )

        self.db.add(refresh_token)
        self.db.flush()
        self.db.refresh(refresh_token)

        return refresh_token

    def get_active_by_hash(self, token_hash: str) -> RefreshToken | None:
        statement = select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > datetime.now(UTC),
        )
        return self.db.scalar(statement)

    def revoke(self, refresh_token: RefreshToken) -> RefreshToken:
        refresh_token.revoked_at = datetime.now(UTC)
        self.db.add(refresh_token)
        self.db.flush()
        self.db.refresh(refresh_token)

        return refresh_token
