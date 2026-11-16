from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from Back.models.base import Base

if TYPE_CHECKING:
    from Back.models.product_model import Product

class ProductImage(Base):
    __tablename__ = "product_images"

    image_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    product: Mapped["Product"] = relationship("Product", back_populates="images")
