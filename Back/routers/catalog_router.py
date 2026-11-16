from typing import Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from Back.core.database import get_read_db_session
from Back.repositories.product_repo import ProductRepository
from Back.repositories.category_repo import CategoryRepository
from Back.services.catalog_service import CatalogService
from Back.dtos.product_dto import ProductFilterDTO, PaginatedProductsResponse, ProductResponse
from Back.dtos.category_dto import CategoryResponse

router = APIRouter(prefix="/api", tags=["Catalog"])

def get_catalog_service(session: AsyncSession = Depends(get_read_db_session)) -> CatalogService:
    return CatalogService(ProductRepository(session), CategoryRepository(session))

@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(service: CatalogService = Depends(get_catalog_service)):
    return await service.list_categories()

@router.get("/products", response_model=PaginatedProductsResponse)
async def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    min_price: Optional[Decimal] = Query(None),
    max_price: Optional[Decimal] = Query(None),
    service: CatalogService = Depends(get_catalog_service)
):
    filter_dto = ProductFilterDTO(
        page=page,
        limit=limit,
        search=search,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price
    )
    return await service.get_products(filter_dto)

@router.get("/products/{id_or_slug}", response_model=ProductResponse)
async def get_product(id_or_slug: str, service: CatalogService = Depends(get_catalog_service)):
    return await service.get_product_by_id_or_slug(id_or_slug)
