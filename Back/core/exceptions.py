from typing import Any, Optional

class AppException(Exception):
    """Base application exception for cosmetic shop domain."""
    def __init__(
        self,
        message: str,
        status_code: int = 400,
        error_code: str = "BAD_REQUEST",
        details: Optional[Any] = None
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details

class NotFoundException(AppException):
    def __init__(self, message: str = "Recurso não encontrado", details: Optional[Any] = None):
        super().__init__(message=message, status_code=404, error_code="NOT_FOUND", details=details)

class UnauthorizedException(AppException):
    def __init__(self, message: str = "Não autorizado", details: Optional[Any] = None):
        super().__init__(message=message, status_code=401, error_code="UNAUTHORIZED", details=details)

class ForbiddenException(AppException):
    def __init__(self, message: str = "Acesso proibido", details: Optional[Any] = None):
        super().__init__(message=message, status_code=403, error_code="FORBIDDEN", details=details)

class ConflictException(AppException):
    def __init__(self, message: str = "Conflito de estado", details: Optional[Any] = None):
        super().__init__(message=message, status_code=409, error_code="CONFLICT", details=details)

class OutOfStockException(ConflictException):
    def __init__(self, message: str = "Produto sem estoque disponível"):
        super().__init__(message=message)
        self.error_code = "OUT_OF_STOCK"
