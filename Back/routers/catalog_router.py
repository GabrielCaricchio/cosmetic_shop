from typing import Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from Back.core.database import get_read_db_session
from Back.repositories.product_repo import ProductRepository
from Back.repositories.category_repo import CategoryRepository
from Back.services.catalog_service import CatalogService
from Back.dtos.product_dto import ProductFilterDTO, PaginatedProductsResponse, ProductResponse
from Back.dtos.category_dto import CategoryResponse
from Back.dtos.error_dto import ErrorResponseDTO, COMMON_RESPONSES

router = APIRouter(prefix="/api", tags=["Catalog"])

def get_catalog_service(session: AsyncSession = Depends(get_read_db_session)) -> CatalogService:
    return CatalogService(ProductRepository(session), CategoryRepository(session))

@router.get(
    "/categories",
    response_model=list[CategoryResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar categorias de cosméticos",
    description="""
Retorna todas as categorias ativas cadastradas na plataforma (ex: Maquiagem, Cuidados com a Pele, Cabelos, Perfumaria), ordenadas por nome para navegação na vitrine e filtros rápidos.
""",
    responses={
        200: {
            "model": list[CategoryResponse],
            "description": "Lista de categorias ativas recuperada com sucesso."
        }
    }
)
async def list_categories(service: CatalogService = Depends(get_catalog_service)):
    return await service.list_categories()

@router.get(
    "/products",
    response_model=PaginatedProductsResponse,
    status_code=status.HTTP_200_OK,
    summary="Buscar e filtrar produtos no catálogo (Fuzzy Search via pg_trgm)",
    description="""
Pesquisa cosméticos na vitrine com suporte a:
- **Busca Fuzzy Trigram (`pg_trgm`)**: Tolerância a erros ortográficos, variações fonéticas e acentuações (ex: *"batom vermêlho"*, *"shampô hidratação"*).
- **Filtros Combinados**: Por categoria (`category_id`), faixa de preço mínima (`min_price`) e máxima (`max_price`).
- **Paginação Eficiente**: Controle de `page` e `limit` com totalizadores para navegação infinita ou paginada.
""",
    responses={
        200: {
            "model": PaginatedProductsResponse,
            "description": "Página de produtos e metadados de paginação calculados."
        },
        422: COMMON_RESPONSES[422]
    }
)
async def list_products(
    page: int = Query(1, ge=1, description="Número da página (iniciando em 1)."),
    limit: int = Query(20, ge=1, le=100, description="Itens por página (entre 1 e 100)."),
    search: Optional[str] = Query(None, description="Termo livre de busca textual com tolerância a erros."),
    q: Optional[str] = Query(None, description="Alias para termo de busca textual."),
    category_id: Optional[int] = Query(None, description="Filtrar por identificador único de categoria."),
    category: Optional[str] = Query(None, description="Filtrar por ID ou slug de categoria."),
    min_price: Optional[Decimal] = Query(None, ge=0, description="Preço mínimo em BRL."),
    max_price: Optional[Decimal] = Query(None, ge=0, description="Preço máximo em BRL."),
    service: CatalogService = Depends(get_catalog_service)
):
    search_term = search or q
    cat_id = category_id
    cat_slug = None
    if category:
        if category.isdigit():
            cat_id = int(category)
        else:
            cat_slug = category

    filter_dto = ProductFilterDTO(
        page=page,
        limit=limit,
        search=search_term,
        category_id=cat_id,
        category_slug=cat_slug,
        min_price=min_price,
        max_price=max_price
    )
    return await service.get_products(filter_dto)

@router.get(
    "/products/{id_or_slug}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter detalhes de um cosmético por ID ou Slug (PDP)",
    description="""
Recupera as informações completas de um produto para exibição na página de detalhes (Product Detail Page - PDP):
- Informações comerciais (Nome, Marca, Preço, Fotos).
- Informações dermatológicas (Ingredientes/Composição INCI e Modo de Uso).
- Saldo disponível em estoque para validação de compra.
Pode ser consultado tanto pelo ID numérico (ex: `1`) quanto pelo slug de URL (ex: `batom-matte-velvet-red`).
""",
    responses={
        200: {
            "model": ProductResponse,
            "description": "Detalhes completos do produto."
        },
        404: {
            "model": ErrorResponseDTO,
            "description": "Cosmético não encontrado ou inativo no catálogo."
        }
    }
)
async def get_product(
    id_or_slug: str = Path(..., description="ID numérico ou slug textual do produto.", examples=["batom-matte-velvet-red"]),
    service: CatalogService = Depends(get_catalog_service)
):
    return await service.get_product_by_id_or_slug(id_or_slug)
