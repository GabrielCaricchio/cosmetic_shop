from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel, Field

class CartItemDTO(BaseModel):
    product_id: int
    name: str
    price: Decimal
    quantity: int = Field(..., ge=1)
    subtotal: Decimal
    image_url: Optional[str] = None

class CartDTO(BaseModel):
    items: List[CartItemDTO] = []
    total_amount: Decimal = Decimal("0.00")
    total_items: int = 0

class AddCartItemRequest(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)

class UpdateCartItemRequest(BaseModel):
    quantity: int = Field(..., ge=1)
