from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_database_session
from app.modules.auth.schema import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse
from app.modules.auth.service import AuthService
from app.modules.users.model import User
from app.modules.users.schema import UserCreate, UserRead

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
    db: Session = Depends(get_database_session),
) -> TokenResponse:
    service = AuthService(db)
    return service.login(
        email=payload.email,
        password=payload.password,
    )


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
