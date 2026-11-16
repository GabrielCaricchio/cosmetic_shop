from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from Back.core.database import get_db_session
from Back.core.dependencies import get_current_client
from Back.dtos.auth_dto import RegisterClientRequest, LoginRequest, TokenResponse, UserProfileResponse
from Back.repositories.client_repo import ClientRepository
from Back.repositories.admin_repo import AdminRepository
from Back.services.auth_service import AuthService
from Back.models.client_model import Client

router = APIRouter(prefix="/api", tags=["Auth"])

def get_auth_service(session: AsyncSession = Depends(get_db_session)) -> AuthService:
    return AuthService(ClientRepository(session), AdminRepository(session))

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    req: RegisterClientRequest,
    service: AuthService = Depends(get_auth_service)
):
    return await service.register_client(req)

@router.post("/login", response_model=TokenResponse)
async def login(
    req: LoginRequest,
    service: AuthService = Depends(get_auth_service)
):
    return await service.login_client(req)

@router.get("/me", response_model=UserProfileResponse)
async def get_me(current_user: Client = Depends(get_current_client)):
    return UserProfileResponse(
        id=current_user.client_id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        role="client"
    )
