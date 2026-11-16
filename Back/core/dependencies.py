from collections.abc import AsyncGenerator
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis
from Back.core.database import get_db_session, get_read_db_session
from Back.core.redis_client import get_redis
from Back.core.security import decode_access_token
from Back.core.exceptions import UnauthorizedException, ForbiddenException
from Back.repositories.client_repo import ClientRepository
from Back.repositories.admin_repo import AdminRepository
from Back.models.client_model import Client
from Back.models.admin_model import Administrator

security_scheme = HTTPBearer(auto_error=False)

async def get_current_token_payload(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
) -> dict:
    if not credentials:
        raise UnauthorizedException("Cabeçalho de autenticação ausente")
    return decode_access_token(credentials.credentials)

async def get_current_client(
    payload: dict = Depends(get_current_token_payload),
    session: AsyncSession = Depends(get_db_session)
) -> Client:
    if payload.get("role") != "client":
        raise ForbiddenException("Token não pertence a um cliente")
    client_id = int(payload.get("sub"))
    repo = ClientRepository(session)
    client = await repo.get_by_id(client_id)
    if not client:
        raise UnauthorizedException("Cliente não encontrado")
    return client

async def get_optional_current_client(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    session: AsyncSession = Depends(get_db_session)
) -> Optional[Client]:
    if not credentials:
        return None
    try:
        payload = decode_access_token(credentials.credentials)
        if payload.get("role") != "client":
            return None
        client_id = int(payload.get("sub"))
        repo = ClientRepository(session)
        return await repo.get_by_id(client_id)
    except Exception:
        return None

def require_admin_role(required_role: str = "Admin"):
    async def role_checker(
        payload: dict = Depends(get_current_token_payload),
        session: AsyncSession = Depends(get_db_session)
    ) -> Administrator:
        role = payload.get("role")
        if not role or role not in ["Admin", "SuperAdmin", required_role]:
            raise ForbiddenException("Permissão insuficiente para rota administrativa")
        admin_id = int(payload.get("sub"))
        repo = AdminRepository(session)
        admin = await repo.get_by_id(admin_id)
        if not admin:
            raise UnauthorizedException("Administrador não encontrado")
        return admin
    return role_checker
