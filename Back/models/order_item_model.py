import uuid
from typing import TYPE_CHECKING
from decimal import Decimal
from sqlalchemy import Numeric, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from Back.models.base import Base

if TYPE_CHECKING:
    from Back.models.order_model import Order
    from Back.models.product_model import Product

class OrderItem(Base):
    __tablename__ = "order_items"

    item_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("orders.order_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.product_id", ondelete="RESTRICT"),
        nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    order: Mapped["Order"] = relationship("Order", back_populates="items")
    product: Mapped["Product"] = relationship("Product", back_populates="order_items")
