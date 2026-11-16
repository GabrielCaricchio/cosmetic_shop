from datetime import datetime, timezone
from typing import List, TYPE_CHECKING
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from Back.models.base import Base

if TYPE_CHECKING:
    from Back.models.product_model import Product

class Category(Base):
    __tablename__ = "categories"

    category_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    products: Mapped[List["Product"]] = relationship("Product", back_populates="category")
