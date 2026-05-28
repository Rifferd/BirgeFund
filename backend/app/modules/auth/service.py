from app.core.security import hash_password, verify_password


class AuthService:
    def get_password_hash(self, password: str) -> str:
        return hash_password(password)

    def verify_password(self, plain_password: str, password_hash: str) -> bool:
        return verify_password(plain_password, password_hash)
