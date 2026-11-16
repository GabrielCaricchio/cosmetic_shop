from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from Back.core.database import get_db_session
from Back.dtos.auth_dto import AdminLoginRequest, TokenResponse
from Back.repositories.client_repo import ClientRepository
from Back.repositories.admin_repo import AdminRepository
from Back.services.auth_service import AuthService

router = APIRouter(prefix="/api/admin", tags=["Admin Auth"])

def get_auth_service(session: AsyncSession = Depends(get_db_session)) -> AuthService:
    return AuthService(ClientRepository(session), AdminRepository(session))

@router.post("/login", response_model=TokenResponse)
async def admin_login(
    req: AdminLoginRequest,
    service: AuthService = Depends(get_auth_service)
):
    return await service.login_admin(req)
