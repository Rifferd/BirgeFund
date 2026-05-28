from fastapi import HTTPException, status
from redis.exceptions import RedisError

from app.core.redis import get_redis_client


class LoginRateLimiter:
    def __init__(
        self,
        *,
        max_attempts: int = 5,
        window_seconds: int = 600,
    ) -> None:
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds

    def _key(self, identifier: str) -> str:
        safe_identifier = identifier.lower().strip()
        return f"rate-limit:login:{safe_identifier}"

    def check(self, identifier: str) -> None:
        key = self._key(identifier)

        try:
            redis = get_redis_client()
            attempts = redis.get(key)
        except RedisError:
            # Не валим login, если Redis временно недоступен в demo/local.
            return

        if attempts is not None and int(attempts) >= self.max_attempts:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "message": "Слишком много неудачных попыток входа. Попробуйте позже.",
                    "code": "TOO_MANY_LOGIN_ATTEMPTS",
                },
            )

    def hit(self, identifier: str) -> None:
        key = self._key(identifier)

        try:
            redis = get_redis_client()
            attempts = redis.incr(key)

            if attempts == 1:
                redis.expire(key, self.window_seconds)
        except RedisError:
            return

    def reset(self, identifier: str) -> None:
        key = self._key(identifier)

        try:
            get_redis_client().delete(key)
        except RedisError:
            return
