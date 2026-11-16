from Back.repositories.client_repo import ClientRepository
from Back.repositories.admin_repo import AdminRepository
from Back.models.client_model import Client
from Back.dtos.auth_dto import RegisterClientRequest, LoginRequest, TokenResponse, AdminLoginRequest, UserProfileResponse
from Back.core.security import hash_password, verify_password, create_access_token
from Back.core.exceptions import AppException, UnauthorizedException, ConflictException

class AuthService:
    def __init__(self, client_repo: ClientRepository, admin_repo: AdminRepository):
        self.client_repo = client_repo
        self.admin_repo = admin_repo

    async def register_client(self, req: RegisterClientRequest) -> TokenResponse:
        if not req.lgpd_consent:
            raise AppException("O consentimento LGPD é obrigatório para cadastrar-se.", status_code=400)
        
        existing = await self.client_repo.get_by_email(req.email)
        if existing:
            raise ConflictException("E-mail já cadastrado no sistema")

        hashed_pw = hash_password(req.password)
        client = Client(
            name=req.name.strip(),
            email=req.email.lower().strip(),
            password_hash=hashed_pw,
            phone=req.phone.strip() if req.phone else None,
            lgpd_consent=req.lgpd_consent
        )
        saved = await self.client_repo.create(client)

        token = create_access_token({"sub": str(saved.client_id), "role": "client", "name": saved.name})
        user_info = {
            "id": saved.client_id,
            "user_id": saved.client_id,
            "name": saved.name,
            "email": saved.email,
            "phone": saved.phone,
            "role": "client"
        }
        return TokenResponse(
            access_token=token,
            role="client",
            user_id=saved.client_id,
            name=saved.name,
            user=user_info
        )

    async def login_client(self, req: LoginRequest) -> TokenResponse:
        client = await self.client_repo.get_by_email(req.email)
        if not client or not verify_password(req.password, client.password_hash):
            raise UnauthorizedException("Credenciais inválidas")

        token = create_access_token({"sub": str(client.client_id), "role": "client", "name": client.name})
        user_info = {
            "id": client.client_id,
            "user_id": client.client_id,
            "name": client.name,
            "email": client.email,
            "phone": client.phone,
            "role": "client"
        }
        return TokenResponse(
            access_token=token,
            role="client",
            user_id=client.client_id,
            name=client.name,
            user=user_info
        )

    async def login_admin(self, req: AdminLoginRequest) -> TokenResponse:
        admin = await self.admin_repo.get_by_email(req.email)
        if not admin or not verify_password(req.password, admin.password_hash):
            raise UnauthorizedException("Credenciais administrativas inválidas")

        token = create_access_token({"sub": str(admin.admin_id), "role": admin.role, "name": admin.name})
        user_info = {
            "id": admin.admin_id,
            "user_id": admin.admin_id,
            "name": admin.name,
            "email": admin.email,
            "role": admin.role
        }
        return TokenResponse(
            access_token=token,
            role=admin.role,
            user_id=admin.admin_id,
            name=admin.name,
            user=user_info
        )
