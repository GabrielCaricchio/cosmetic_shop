import re
import unicodedata
from typing import Optional, List, Any
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict, model_validator
from datetime import datetime

def slugify(text: str) -> str:
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text)

class ProductFilterDTO(BaseModel):
    page: int = Field(default=1, ge=1, description="Número da página para paginação de resultados.", examples=[1])
    limit: int = Field(default=20, ge=1, le=100, description="Quantidade máxima de cosméticos por página (máx. 100).", examples=[20])
    search: Optional[str] = Field(None, description="Termo para busca textual tolerante a erros ortográficos e acentos via pg_trgm.", examples=["batom vermelho"])
    category_id: Optional[int] = Field(None, description="Filtro opcional por identificador da categoria.", examples=[1])
    category_slug: Optional[str] = Field(None, description="Filtro opcional por slug da categoria.", examples=["maquiagem"])
    min_price: Optional[Decimal] = Field(None, ge=0, description="Preço unitário mínimo para filtro.", examples=[19.90])
    max_price: Optional[Decimal] = Field(None, ge=0, description="Preço unitário máximo para filtro.", examples=[150.00])

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit

    def clean_search_query(self) -> str:
        if not self.search:
            return ""
        cleaned = re.sub(r'[^\w\s]', ' ', self.search, flags=re.UNICODE)
        return " ".join(cleaned.split()).strip()

class ProductImageDTO(BaseModel):
    image_id: int = Field(..., description="Identificador único da imagem no banco de dados.", examples=[10])
    image_url: str = Field(..., description="URL pública ou CDN da foto do cosmético.", examples=["https://images.unsplash.com/photo-1586495777744-4413f21062fa"])
    is_primary: bool = Field(..., description="Indica se é a foto principal exibida no card do catálogo.", examples=[True])
    display_order: int = Field(..., description="Ordem de exibição na galeria da PDP.", examples=[1])

    model_config = ConfigDict(from_attributes=True)

class ProductResponse(BaseModel):
    product_id: int = Field(..., description="ID único do cosmético.", examples=[1])
    category_id: Optional[int] = Field(None, description="ID da categoria a que pertence.", examples=[1])
    name: str = Field(..., description="Nome comercial do cosmético.", examples=["Batom Matte Velvet Red"])
    slug: str = Field(..., description="Slug amigável para SEO e rota na loja.", examples=["batom-matte-velvet-red"])
    brand: str = Field(..., description="Marca ou fabricante parceiro do cosmético.", examples=["Aura Glow"])
    description: Optional[str] = Field(None, description="Descrição detalhada dos benefícios, acabamento e textura.", examples=["Batom líquido de longa duração com acabamento aveludado e alta pigmentação."])
    ingredients: Optional[str] = Field(None, description="Composição dermatológica completa (INCI) e modo de uso.", examples=["Aqua, Dimethicone, Isododecane, Tocopherol (Vitamina E), Ácido Hialurônico."])
    price: Decimal = Field(..., description="Preço de venda unitário em Reais (BRL).", examples=[49.90])
    stock_quantity: int = Field(..., description="Saldo físico disponível em estoque.", examples=[45])
    is_active: bool = Field(..., description="Disponibilidade para exibição e compra no e-commerce.", examples=[True])
    images: List[ProductImageDTO] = Field(default=[], description="Galeria de imagens do cosmético.")
    created_at: datetime = Field(..., description="Data e hora de cadastro.")
    updated_at: datetime = Field(..., description="Data e hora da última modificação.")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "product_id": 1,
                "category_id": 1,
                "name": "Batom Matte Velvet Red",
                "slug": "batom-matte-velvet-red",
                "brand": "Aura Glow",
                "description": "Batom líquido de alta pigmentação com acabamento aveludado sem craquelar.",
                "ingredients": "Dimethicone, Isododecane, Tocopherol (Vitamina E), Ácido Hialurônico.",
                "price": 49.90,
                "stock_quantity": 45,
                "is_active": True,
                "images": [
                    {
                        "image_id": 1,
                        "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa",
                        "is_primary": True,
                        "display_order": 1
                    }
                ],
                "created_at": "2026-11-16T08:00:00Z",
                "updated_at": "2026-11-16T08:00:00Z"
            }
        }
    )

class PaginatedProductsResponse(BaseModel):
    items: List[ProductResponse] = Field(..., description="Lista de cosméticos correspondentes aos filtros aplicados.")
    total: int = Field(..., description="Total absoluto de produtos encontrados.", examples=[120])
    page: int = Field(..., description="Página atual da listagem.", examples=[1])
    limit: int = Field(..., description="Limite de itens por página.", examples=[20])
    total_pages: int = Field(..., description="Total de páginas calculadas.", examples=[6])

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "items": [],
                "total": 120,
                "page": 1,
                "limit": 20,
                "total_pages": 6
            }
        }
    )

class ProductCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Nome do produto.", examples=["Sérum Facial Antioxidante Vitamina C"])
    slug: Optional[str] = Field(None, max_length=280, description="Slug único amigável para URLs. Se omitido, é gerado a partir do nome.", examples=["serum-facial-vitamina-c"])
    brand: str = Field(default="Aura Cosméticos", min_length=1, max_length=100, description="Nome da marca.", examples=["Aura Derm"])
    category_id: Optional[int] = Field(None, description="ID da categoria associada.", examples=[2])
    description: Optional[str] = Field(None, description="Texto descritivo de benefícios e aplicação.", examples=["Sérum concentrado com 15% de Vitamina C pura e Ácido Ferúlico."])
    ingredients: Optional[str] = Field(None, description="Fórmula e lista de ingredientes INCI.", examples=["Ascorbic Acid 15%, Ferulic Acid 0.5%, Hyaluronic Acid."])
    price: Decimal = Field(..., ge=0, description="Preço de venda em Reais (BRL).", examples=[89.90])
    stock_quantity: int = Field(default=0, ge=0, description="Quantidade inicial para estoque no banco e trava Redis.", examples=[100])
    is_active: bool = Field(True, description="Se o produto estará imediatamente visível na vitrine.", examples=[True])
    image_urls: List[str] = Field(default=[], description="Lista de URLs das fotos do produto.", examples=[["https://images.unsplash.com/photo-1620916566398-39f1143ab7be"]])
    images: Optional[List[dict]] = Field(default=None, description="Lista de objetos de imagem.")

    @model_validator(mode="before")
    @classmethod
    def populate_defaults_and_slug(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if not data.get("slug") and data.get("name"):
                data["slug"] = slugify(data["name"])
            if not data.get("image_urls") and data.get("images"):
                urls = []
                for img in data["images"]:
                    if isinstance(img, dict) and img.get("image_url"):
                        urls.append(img["image_url"])
                    elif isinstance(img, str):
                        urls.append(img)
                data["image_urls"] = urls
        return data

class ProductUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255, description="Novo nome do cosmético.")
    slug: Optional[str] = Field(None, min_length=2, max_length=280, description="Novo slug do produto.")
    brand: Optional[str] = Field(None, min_length=1, max_length=100, description="Nova marca.")
    category_id: Optional[int] = Field(None, description="Novo ID de categoria.")
    description: Optional[str] = Field(None, description="Nova descrição detalhada.")
    ingredients: Optional[str] = Field(None, description="Nova fórmula dermatológica.")
    price: Optional[Decimal] = Field(None, ge=0, description="Novo preço unitário em BRL.")
    stock_quantity: Optional[int] = Field(None, ge=0, description="Novo saldo em estoque físico.")
    is_active: Optional[bool] = Field(None, description="Ativar ou desativar o produto no catálogo.")
