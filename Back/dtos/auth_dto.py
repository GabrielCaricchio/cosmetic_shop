from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class RegisterClientRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    phone: Optional[str] = Field(None, max_length=20)
    lgpd_consent: bool = Field(True, description="Consentimento explícito LGPD")

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    name: str

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: str
