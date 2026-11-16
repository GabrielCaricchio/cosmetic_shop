import enum
import uuid
from typing import List, Optional, Any, TYPE_CHECKING
from decimal import Decimal
from sqlalchemy import String, Numeric, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from Back.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from Back.models.client_model import Client
    from Back.models.order_item_model import OrderItem
    from Back.models.payment_model import Payment

class OrderStatusEnum(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class Order(Base, TimestampMixin):
    __tablename__ = "orders"

    order_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.client_id", ondelete="RESTRICT"), nullable=False, index=True)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[OrderStatusEnum] = mapped_column(
        SQLEnum(OrderStatusEnum, name="order_status_enum"),
        default=OrderStatusEnum.PENDING,
        nullable=False,
        index=True
    )
    shipping_address: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)

    client: Mapped["Client"] = relationship("Client", back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments: Mapped[List["Payment"]] = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
