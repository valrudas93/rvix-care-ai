from fastapi import HTTPException, status


class NotFoundError(HTTPException):
    def __init__(self, resource: str = "Recurso"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=f"{resource} no encontrado.")


class UnauthorizedError(HTTPException):
    def __init__(self, detail: str = "No autorizado"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class ConflictError(HTTPException):
    def __init__(self, detail: str = "Conflicto de datos"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class BadRequestError(HTTPException):
    def __init__(self, detail: str = "Petición inválida"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
