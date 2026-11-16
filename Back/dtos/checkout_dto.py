from typing import List, Optional, Any
from decimal import Decimal
from pydantic import BaseModel, Field

class ShippingAddressDTO(BaseModel):
    street: str = Field(..., min_length=2)
    number: str = Field(...)
    complement: Optional[str] = None
    neighborhood: str = Field(...)
    city: str = Field(...)
    state: str = Field(..., min_length=2, max_length=2)
    zip_code: str = Field(..., min_length=8, max_length=9)

class CheckoutItemDTO(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1)

class CheckoutRequestDTO(BaseModel):
    items: List[CheckoutItemDTO] = Field(..., min_length=1)
    shipping_address: ShippingAddressDTO
    payment_method: str = Field(default="pix")

class DirectCheckoutRequestDTO(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)
    shipping_address: ShippingAddressDTO
    payment_method: str = Field(default="pix")

class CheckoutResponseDTO(BaseModel):
    order_id: str
    total_amount: Decimal
    status: str
    payment_method: str
    pix_qr_code_base64: Optional[str] = None
    pix_copy_paste: Optional[str] = None
    expires_at: str
