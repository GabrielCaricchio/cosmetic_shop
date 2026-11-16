from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from Back.core.database import get_db_session
from Back.core.dependencies import get_current_client
from Back.dtos.auth_dto import RegisterClientRequest, LoginRequest, TokenResponse, UserProfileResponse
from Back.dtos.error_dto import ErrorResponseDTO, COMMON_RESPONSES
from Back.repositories.client_repo import ClientRepository
from Back.repositories.admin_repo import AdminRepository
from Back.services.auth_service import AuthService
from Back.models.client_model import Client

router = APIRouter(prefix="/api", tags=["Auth"])

def get_auth_service(session: AsyncSession = Depends(get_db_session)) -> AuthService:
    return AuthService(ClientRepository(session), AdminRepository(session))

@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar nova cliente",
    description="""
Cria uma nova conta de cliente na plataforma com hashing seguro de senha via Argon2id e registro explícito do consentimento LGPD.
Retorna imediatamente o token JWT de acesso e perfil da cliente para login automático.
""",
    responses={
        201: {
            "model": TokenResponse,
            "description": "Cliente cadastrada com sucesso e token JWT emitido."
        },
        400: COMMON_RESPONSES[400],
        409: {
            "model": ErrorResponseDTO,
            "description": "E-mail já cadastrado na plataforma."
        },
        422: COMMON_RESPONSES[422]
    }
)
async def register(
    req: RegisterClientRequest,
    service: AuthService = Depends(get_auth_service)
):
    return await service.register_client(req)

@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Autenticar cliente (Login)",
    description="""
Realiza a autenticação da cliente verificando e-mail e hash da senha com Argon2id.
Retorna o token de acesso Bearer JWT com validade de 24 horas.
""",
    responses={
        200: {
            "model": TokenResponse,
            "description": "Autenticação bem-sucedida com emissão do token JWT."
        },
        401: {
            "model": ErrorResponseDTO,
            "description": "Credenciais incorretas (e-mail inexistente ou senha inválida)."
        },
        422: COMMON_RESPONSES[422]
    }
)
async def login(
    req: LoginRequest,
    service: AuthService = Depends(get_auth_service)
):
    return await service.login_client(req)

@router.get(
    "/me",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter perfil da cliente autenticada",
    description="""
Retorna os dados cadastrais da cliente atualmente autenticada a partir do token Bearer JWT informado no cabeçalho `Authorization: Bearer <token>`.
""",
    responses={
        200: {
            "model": UserProfileResponse,
            "description": "Perfil da cliente autenticada recuperado com sucesso."
        },
        401: COMMON_RESPONSES[401],
        403: COMMON_RESPONSES[403],
        404: COMMON_RESPONSES[404]
    }
)
async def get_me(current_user: Client = Depends(get_current_client)):
    return UserProfileResponse(
        id=current_user.client_id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        role="client"
    )
