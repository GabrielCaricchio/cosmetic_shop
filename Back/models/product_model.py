from typing import Optional, List, TYPE_CHECKING
from decimal import Decimal
from sqlalchemy import String, Text, Numeric, Integer, Boolean, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from Back.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from Back.models.category_model import Category
    from Back.models.product_image_model import ProductImage
    from Back.models.order_item_model import OrderItem

class Product(Base, TimestampMixin):
    __tablename__ = "products"

    product_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    category_id: Mapped[Optional[int]] = mapped_column(ForeignKey("categories.category_id", ondelete="SET NULL"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(280), unique=True, index=True, nullable=False)
    brand: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ingredients: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    stock_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)

    category: Mapped[Optional["Category"]] = relationship("Category", back_populates="products")
    images: Mapped[List["ProductImage"]] = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    order_items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="product")

    __table_args__ = (
        Index(
            "idx_products_name_trgm",
            "name",
            postgresql_using="gist",
            postgresql_ops={"name": "gist_trgm_ops"}
        ),
    )
