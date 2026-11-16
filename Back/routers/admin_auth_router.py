from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from Back.core.database import get_db_session
from Back.dtos.auth_dto import AdminLoginRequest, TokenResponse
from Back.dtos.error_dto import ErrorResponseDTO, COMMON_RESPONSES
from Back.repositories.client_repo import ClientRepository
from Back.repositories.admin_repo import AdminRepository
from Back.services.auth_service import AuthService

router = APIRouter(prefix="/api/admin", tags=["Admin Auth"])

def get_auth_service(session: AsyncSession = Depends(get_db_session)) -> AuthService:
    return AuthService(ClientRepository(session), AdminRepository(session))

@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Login administrativo (Backoffice RBAC)",
    description="""
Autentica administradores e gestores do sistema validando as credenciais no banco de dados e verificando a senha com **Argon2id**.
Retorna o token JWT contendo os papéis administrativos autorizados (`role: 'Admin'` ou `'SuperAdmin'`).
""",
    responses={
        200: {
            "model": TokenResponse,
            "description": "Login administrativo autorizado com token JWT emitido."
        },
        401: {
            "model": ErrorResponseDTO,
            "description": "Credenciais administrativas incorretas."
        },
        422: COMMON_RESPONSES[422]
    }
)
async def admin_login(
    req: AdminLoginRequest,
    service: AuthService = Depends(get_auth_service)
):
    return await service.login_admin(req)
