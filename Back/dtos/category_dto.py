from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class CategoryCreateRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Nome da categoria de cosméticos (ex: Maquiagem, Cuidados com a Pele, Perfumaria).",
        examples=["Cuidados com a Pele"]
    )
    slug: str = Field(
        ...,
        min_length=2,
        max_length=120,
        description="Identificador amigável para URLs (slug), sem acentos e em minúsculas.",
        examples=["cuidados-com-a-pele"]
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Cuidados com a Pele",
                "slug": "cuidados-com-a-pele"
            }
        }
    )

class CategoryResponse(BaseModel):
    category_id: int = Field(..., description="ID sequencial único da categoria.", examples=[1])
    name: str = Field(..., description="Nome da categoria.", examples=["Cuidados com a Pele"])
    slug: str = Field(..., description="Slug amigável para SEO e filtros de vitrine.", examples=["cuidados-com-a-pele"])
    created_at: datetime = Field(..., description="Data e hora de criação da categoria.")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "category_id": 1,
                "name": "Cuidados com a Pele",
                "slug": "cuidados-com-a-pele",
                "created_at": "2026-11-16T08:00:00Z"
            }
        }
    )
