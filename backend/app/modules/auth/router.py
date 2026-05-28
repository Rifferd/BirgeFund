from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_database_session
from app.modules.auth.schema import LoginRequest, RegisterRequest
from app.modules.auth.service import AuthService
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


@router.post("/login", response_model=UserRead)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_database_session),
) -> UserRead:
    service = AuthService(db)
    user = service.authenticate(
        email=payload.email,
        password=payload.password,
    )

    return user
