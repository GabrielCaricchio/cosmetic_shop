import enum
import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from decimal import Decimal
from sqlalchemy import String, Numeric, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from Back.models.base import Base

if TYPE_CHECKING:
    from Back.models.order_model import Order

class PaymentMethodEnum(str, enum.Enum):
    PIX = "pix"
    CREDIT_CARD = "credit_card"
    BOLETO = "boleto"

class Payment(Base):
    __tablename__ = "payments"

    payment_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("orders.order_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    method: Mapped[PaymentMethodEnum] = mapped_column(
        SQLEnum(PaymentMethodEnum, name="payment_method_enum"),
        nullable=False
    )
    gateway: Mapped[str] = mapped_column(String(50), nullable=False)
    gateway_transaction_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    pix_qr_code_base64: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    pix_copy_paste: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    order: Mapped["Order"] = relationship("Order", back_populates="payments")
