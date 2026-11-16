from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from Back.core.database import get_db_session
from Back.core.dependencies import require_admin_role
from Back.repositories.product_repo import ProductRepository
from Back.repositories.category_repo import CategoryRepository
from Back.services.catalog_service import CatalogService
from Back.dtos.product_dto import ProductCreateRequest, ProductUpdateRequest, ProductResponse

router = APIRouter(prefix="/api/admin/products", tags=["Admin Products"])

def get_admin_catalog_service(session: AsyncSession = Depends(get_db_session)) -> CatalogService:
    return CatalogService(ProductRepository(session), CategoryRepository(session))

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    req: ProductCreateRequest,
    service: CatalogService = Depends(get_admin_catalog_service),
    _admin = Depends(require_admin_role())
):
    return await service.create_product(req)

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    req: ProductUpdateRequest,
    service: CatalogService = Depends(get_admin_catalog_service),
    _admin = Depends(require_admin_role())
):
    return await service.update_product(product_id, req)

@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
async def delete_product(
    product_id: int,
    service: CatalogService = Depends(get_admin_catalog_service),
    _admin = Depends(require_admin_role())
):
    await service.delete_product(product_id)
    return {"message": f"Produto {product_id} desativado com sucesso"}
