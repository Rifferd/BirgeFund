from datetime import UTC, datetime, timedelta
from hashlib import sha256
from uuid import uuid4

from jose import JWTError, jwt
from pwdlib import PasswordHash

from app.core.config import settings

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def create_access_token(subject: str | int) -> str:
    now = datetime.now(UTC)
    expires_at = now + timedelta(minutes=settings.jwt_access_token_expire_minutes)

    payload = {
        "sub": str(subject),
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def create_refresh_token(subject: str | int) -> tuple[str, datetime]:
    now = datetime.now(UTC)
    expires_at = now + timedelta(days=settings.jwt_refresh_token_expire_days)

    payload = {
        "sub": str(subject),
        "type": "refresh",
        "jti": str(uuid4()),
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }

    token = jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )

    return token, expires_at


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError as exc:
        raise ValueError("Invalid token") from exc


def hash_token(token: str) -> str:
    return sha256(token.encode("utf-8")).hexdigest()
