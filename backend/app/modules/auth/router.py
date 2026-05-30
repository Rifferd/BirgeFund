from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, Request

from app.api.deps import get_current_user, get_database_session
from app.modules.auth.schema import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse
from app.modules.auth.service import AuthService
from app.modules.users.model import User
from app.modules.users.schema import UserCreate, UserRead
from app.core.rate_limit import LoginRateLimiter
from app.shared.schemas import MessageResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_database_session),
) -> UserRead:
    service = AuthService(db)
    user = service.register(
        UserCreate(
            email=payload.email,
            password=payload.password,
            full_name=payload.full_name,
            preferred_language=payload.preferred_language,
        )
    )

    return user


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    request: Request,
    db: Session = Depends(get_database_session),
) -> TokenResponse:
    limiter = LoginRateLimiter()

    client_ip = request.client.host if request.client else "unknown"
    login_value = getattr(payload, "email", None) or getattr(payload, "username", None) or "unknown"
    rate_limit_identifier = f"{login_value}:{client_ip}"

    limiter.check(rate_limit_identifier)

    service = AuthService(db)

    try:
        result = service.login(payload.email, payload.password)
    except Exception as exc:
        if exc.__class__.__name__ in {"UnauthorizedException", "PermissionDeniedException"}:
            limiter.hit(rate_limit_identifier)
        raise

    limiter.reset(rate_limit_identifier)

    return result


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    payload: RefreshRequest,
    db: Session = Depends(get_database_session),
) -> TokenResponse:
    service = AuthService(db)
    return service.refresh(payload.refresh_token)


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.post("/logout", response_model=MessageResponse)
def logout(
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    return MessageResponse(message="Вы успешно вышли из аккаунта")