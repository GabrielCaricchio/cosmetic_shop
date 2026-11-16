from typing import List, Optional, Any
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel

class OrderItemDetailDTO(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal

class OrderDetailResponse(BaseModel):
    order_id: str
    client_id: int
    total_amount: Decimal
    status: str
    shipping_address: dict[str, Any]
    items: List[OrderItemDetailDTO]
    payment_method: Optional[str] = None
    pix_qr_code_base64: Optional[str] = None
    pix_copy_paste: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
