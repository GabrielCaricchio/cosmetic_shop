import math
from typing import Optional
from Back.repositories.product_repo import ProductRepository
from Back.repositories.category_repo import CategoryRepository
from Back.models.product_model import Product
from Back.models.product_image_model import ProductImage
from Back.dtos.product_dto import (
    ProductFilterDTO,
    ProductResponse,
    PaginatedProductsResponse,
    ProductCreateRequest,
    ProductUpdateRequest
)
from Back.dtos.category_dto import CategoryResponse, CategoryCreateRequest
from Back.models.category_model import Category
from Back.core.exceptions import NotFoundException, ConflictException

class CatalogService:
    def __init__(self, product_repo: ProductRepository, category_repo: CategoryRepository):
        self.product_repo = product_repo
        self.category_repo = category_repo

    async def list_categories(self) -> list[CategoryResponse]:
        categories = await self.category_repo.list_all()
        return [CategoryResponse.model_validate(c) for c in categories]

    async def get_products(self, filter_dto: ProductFilterDTO) -> PaginatedProductsResponse:
        items, total = await self.product_repo.search_and_filter(filter_dto)
        total_pages = math.ceil(total / filter_dto.limit) if total > 0 else 1
        return PaginatedProductsResponse(
            items=[ProductResponse.model_validate(p) for p in items],
            total=total,
            page=filter_dto.page,
            limit=filter_dto.limit,
            total_pages=total_pages
        )

    async def get_product_by_id_or_slug(self, identifier: str) -> ProductResponse:
        if identifier.isdigit():
            product = await self.product_repo.get_by_id(int(identifier))
        else:
            product = await self.product_repo.get_by_slug(identifier)

        if not product or not product.is_active:
            raise NotFoundException(f"Cosmético '{identifier}' não encontrado")
        return ProductResponse.model_validate(product)

    async def create_product(self, req: ProductCreateRequest) -> ProductResponse:
        existing = await self.product_repo.get_by_slug(req.slug)
        if existing:
            raise ConflictException(f"Já existe um produto com o slug '{req.slug}'")

        product = Product(
            name=req.name,
            slug=req.slug,
            brand=req.brand,
            category_id=req.category_id,
            description=req.description,
            ingredients=req.ingredients,
            price=req.price,
            stock_quantity=req.stock_quantity,
            is_active=req.is_active
        )
        for idx, url in enumerate(req.image_urls):
            product.images.append(ProductImage(
                image_url=url,
                is_primary=(idx == 0),
                display_order=idx
            ))

        created = await self.product_repo.create(product)
        return ProductResponse.model_validate(created)

    async def update_product(self, product_id: int, req: ProductUpdateRequest) -> ProductResponse:
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundException(f"Produto {product_id} não encontrado")

        if req.name is not None: product.name = req.name
        if req.slug is not None: product.slug = req.slug
        if req.brand is not None: product.brand = req.brand
        if req.category_id is not None: product.category_id = req.category_id
        if req.description is not None: product.description = req.description
        if req.ingredients is not None: product.ingredients = req.ingredients
        if req.price is not None: product.price = req.price
        if req.stock_quantity is not None: product.stock_quantity = req.stock_quantity
        if req.is_active is not None: product.is_active = req.is_active

        return ProductResponse.model_validate(product)

    async def delete_product(self, product_id: int) -> None:
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundException(f"Produto {product_id} não encontrado")
        # Soft delete for catalogue integrity
        product.is_active = False
