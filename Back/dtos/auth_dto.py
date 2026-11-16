from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class RegisterClientRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Nome completo da cliente ou revendedora de cosméticos.",
        examples=["Ana Beatriz Silva"]
    )
    email: EmailStr = Field(
        ...,
        description="Endereço de e-mail válido para autenticação e notificações de pedidos.",
        examples=["ana.beatriz@exemplo.com.br"]
    )
    password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        description="Senha segura com no mínimo 6 caracteres.",
        examples=["AuraCosmeticos#2026"]
    )
    phone: Optional[str] = Field(
        None,
        max_length=20,
        description="Número de WhatsApp/telefone para contato e atualizações de entrega (com DDD).",
        examples=["11987654321"]
    )
    lgpd_consent: bool = Field(
        True,
        description="Consentimento explícito em conformidade com a LGPD (Lei Geral de Proteção de Dados).",
        examples=[True]
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Ana Beatriz Silva",
                "email": "ana.beatriz@exemplo.com.br",
                "password": "SenhaSegura#2026",
                "phone": "11987654321",
                "lgpd_consent": True
            }
        }
    }

class LoginRequest(BaseModel):
    email: EmailStr = Field(
        ...,
        description="E-mail de cadastro da cliente.",
        examples=["ana.beatriz@exemplo.com.br"]
    )
    password: str = Field(
        ...,
        description="Senha cadastrada.",
        examples=["SenhaSegura#2026"]
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "ana.beatriz@exemplo.com.br",
                "password": "SenhaSegura#2026"
            }
        }
    }

class TokenResponse(BaseModel):
    access_token: str = Field(
        ...,
        description="JSON Web Token (JWT) assinado com HMAC-SHA256 para autenticação nas rotas protegidas.",
        examples=["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."]
    )
    token_type: str = Field(
        default="bearer",
        description="Tipo do token para uso no header Authorization (sempre 'bearer').",
        examples=["bearer"]
    )
    role: str = Field(
        ...,
        description="Papel do usuário no sistema ('client' para clientes ou 'Admin'/'SuperAdmin' para gestores).",
        examples=["client"]
    )
    user_id: int = Field(
        ...,
        description="Identificador numérico único do usuário no banco de dados.",
        examples=[1]
    )
    name: str = Field(
        ...,
        description="Nome cadastrado do usuário.",
        examples=["Ana Beatriz Silva"]
    )
    user: Optional[dict] = Field(
        default=None,
        description="Dados resumidos do perfil do usuário para frontend.",
        examples=[{"id": 1, "name": "Ana Beatriz Silva", "role": "client"}]
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6ImNsaWVudCIsImV4cCI6MTc5NDU2MDAwMH0.signature",
                "token_type": "bearer",
                "role": "client",
                "user_id": 1,
                "name": "Ana Beatriz Silva"
            }
        }
    }

class AdminLoginRequest(BaseModel):
    email: EmailStr = Field(
        ...,
        description="E-mail corporativo do administrador ou gestor da plataforma.",
        examples=["admin@auracosmeticos.com.br"]
    )
    password: str = Field(
        ...,
        description="Senha do administrador protegida com hash Argon2id.",
        examples=["AdminSuperSeguro#2026"]
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "admin@auracosmeticos.com.br",
                "password": "AdminSuperSeguro#2026"
            }
        }
    }

class UserProfileResponse(BaseModel):
    id: int = Field(..., description="ID da cliente.", examples=[1])
    name: str = Field(..., description="Nome da cliente.", examples=["Ana Beatriz Silva"])
    email: str = Field(..., description="E-mail da cliente.", examples=["ana.beatriz@exemplo.com.br"])
    phone: Optional[str] = Field(None, description="Telefone / WhatsApp.", examples=["11987654321"])
    role: str = Field(default="client", description="Papel da conta.", examples=["client"])

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": 1,
                "name": "Ana Beatriz Silva",
                "email": "ana.beatriz@exemplo.com.br",
                "phone": "11987654321",
                "role": "client"
            }
        }
    }
