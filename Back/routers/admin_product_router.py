from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from Back.core.database import get_db_session
from Back.core.dependencies import require_admin_role
from Back.repositories.product_repo import ProductRepository
from Back.repositories.category_repo import CategoryRepository
from Back.services.catalog_service import CatalogService
from Back.dtos.product_dto import ProductCreateRequest, ProductUpdateRequest, ProductResponse
from Back.dtos.error_dto import ErrorResponseDTO, COMMON_RESPONSES

router = APIRouter(prefix="/api/admin/products", tags=["Admin Products"])

def get_admin_catalog_service(session: AsyncSession = Depends(get_db_session)) -> CatalogService:
    return CatalogService(ProductRepository(session), CategoryRepository(session))

@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar novo cosmético no catálogo",
    description="""
Cria um novo produto de beleza no banco de dados e adiciona suas fotos à galeria.
Exige token JWT com perfil administrativo (`Admin` ou `SuperAdmin`).
""",
    responses={
        201: {
            "model": ProductResponse,
            "description": "Cosmético cadastrado com sucesso no catálogo."
        },
        400: COMMON_RESPONSES[400],
        401: COMMON_RESPONSES[401],
        403: COMMON_RESPONSES[403],
        409: {
            "model": ErrorResponseDTO,
            "description": "Slug de produto já em uso por outro cosmético."
        },
        422: COMMON_RESPONSES[422]
    }
)
async def create_product(
    req: ProductCreateRequest,
    service: CatalogService = Depends(get_admin_catalog_service),
    _admin = Depends(require_admin_role())
):
    return await service.create_product(req)

@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Atualizar dados ou estoque de um cosmético",
    description="""
Modifica informações de catálogo de um produto (preço, saldo em estoque, fórmula/ingredientes, descrição ou status ativo).
Exige autenticação administrativa.
""",
    responses={
        200: {
            "model": ProductResponse,
            "description": "Produto atualizado com sucesso."
        },
        400: COMMON_RESPONSES[400],
        401: COMMON_RESPONSES[401],
        403: COMMON_RESPONSES[403],
        404: {
            "model": ErrorResponseDTO,
            "description": "Cosmético não encontrado."
        },
        422: COMMON_RESPONSES[422]
    }
)
async def update_product(
    product_id: int = Path(..., description="ID do produto a ser editado.", examples=[1]),
    req: ProductUpdateRequest = ...,
    service: CatalogService = Depends(get_admin_catalog_service),
    _admin = Depends(require_admin_role())
):
    return await service.update_product(product_id, req)

@router.delete(
    "/{product_id}",
    status_code=status.HTTP_200_OK,
    summary="Desativar produto do catálogo (Soft Delete)",
    description="""
Inativa um cosmético (`is_active = False`), ocultando-o da vitrine pública de compras sem quebrar o histórico de pedidos passados.
Exige autenticação administrativa.
""",
    responses={
        200: {
            "description": "Produto desativado com sucesso.",
            "content": {
                "application/json": {
                    "example": {"message": "Produto 1 desativado com sucesso"}
                }
            }
        },
        401: COMMON_RESPONSES[401],
        403: COMMON_RESPONSES[403],
        404: {
            "model": ErrorResponseDTO,
            "description": "Produto não encontrado."
        }
    }
)
async def delete_product(
    product_id: int = Path(..., description="ID do produto a ser desativado.", examples=[1]),
    service: CatalogService = Depends(get_admin_catalog_service),
    _admin = Depends(require_admin_role())
):
    await service.delete_product(product_id)
    return {"message": f"Produto {product_id} desativado com sucesso"}
