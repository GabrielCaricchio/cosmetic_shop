from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, desc
from sqlalchemy.orm import selectinload
from Back.models.product_model import Product
from Back.models.product_image_model import ProductImage
from Back.models.category_model import Category
from Back.dtos.product_dto import ProductFilterDTO

class ProductRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, product_id: int) -> Optional[Product]:
        query = (
            select(Product)
            .options(selectinload(Product.images), selectinload(Product.category))
            .where(Product.product_id == product_id)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Optional[Product]:
        query = (
            select(Product)
            .options(selectinload(Product.images), selectinload(Product.category))
            .where(Product.slug == slug)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def search_and_filter(self, filter_dto: ProductFilterDTO) -> Tuple[List[Product], int]:
        clean_search = filter_dto.clean_search_query()
        query = (
            select(Product)
            .options(selectinload(Product.images), selectinload(Product.category))
            .where(Product.is_active == True)
        )
        count_query = select(func.count(Product.product_id)).where(Product.is_active == True)

        if filter_dto.category_id:
            query = query.where(Product.category_id == filter_dto.category_id)
            count_query = count_query.where(Product.category_id == filter_dto.category_id)
        elif filter_dto.category_slug:
            query = query.join(Product.category).where(Category.slug == filter_dto.category_slug)
            count_query = count_query.join(Product.category).where(Category.slug == filter_dto.category_slug)

        if filter_dto.min_price is not None:
            query = query.where(Product.price >= filter_dto.min_price)
            count_query = count_query.where(Product.price >= filter_dto.min_price)

        if filter_dto.max_price is not None:
            query = query.where(Product.price <= filter_dto.max_price)
            count_query = count_query.where(Product.price <= filter_dto.max_price)

        if clean_search:
            # pg_trgm word similarity and similarity matching combined with ILIKE substring
            trgm_cond = or_(
                func.word_similarity(clean_search, Product.name) >= 0.35,
                func.similarity(Product.name, clean_search) >= 0.08,
                Product.name.ilike(f"%{clean_search}%"),
                Product.brand.ilike(f"%{clean_search}%")
            )
            query = query.where(trgm_cond).order_by(desc(func.word_similarity(clean_search, Product.name)))
            count_query = count_query.where(trgm_cond)
        else:
            query = query.order_by(Product.product_id.desc())

        # Pagination
        query = query.offset(filter_dto.offset).limit(filter_dto.limit)

        total_res = await self.session.execute(count_query)
        total = total_res.scalar_one()

        items_res = await self.session.execute(query)
        items = list(items_res.scalars().all())

        return items, total

    async def create(self, product: Product) -> Product:
        self.session.add(product)
        await self.session.flush()
        return product

    async def delete(self, product: Product) -> None:
        await self.session.delete(product)
        await self.session.flush()
