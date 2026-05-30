from fastapi import HTTPException, status


class AppException(HTTPException):
    def __init__(
        self,
        status_code: int,
        detail: str,
        code: str = "APP_ERROR",
    ) -> None:
        super().__init__(
            status_code=status_code,
            detail={
                "message": detail,
                "code": code,
            },
        )


class NotFoundException(AppException):
    def __init__(self, detail: str = "Объект не найден") -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            code="NOT_FOUND",
        )


class PermissionDeniedException(AppException):
    def __init__(self, detail: str = "Недостаточно прав") -> None:
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            code="PERMISSION_DENIED",
        )


class UnauthorizedException(AppException):
    def __init__(self, detail: str = "Неверный email или пароль") -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            code="UNAUTHORIZED",
        )


class BadRequestException(AppException):
    def __init__(self, detail: str = "Некорректный запрос") -> None:
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            code="BAD_REQUEST",
        )


class ConflictException(AppException):
    def __init__(self, detail: str = "Конфликт данных") -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            code="CONFLICT",
        )


class TestModeOnlyException(AppException):
    def __init__(self, detail: str = "Операция доступна только в тестовом режиме") -> None:
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            code="TEST_MODE_ONLY",
        )
