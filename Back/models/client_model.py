from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from Back.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from Back.models.order_model import Order

class Client(Base, TimestampMixin):
    __tablename__ = "clients"

    client_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    lgpd_consent: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    orders: Mapped[List["Order"]] = relationship("Order", back_populates="client")
