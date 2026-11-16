import re
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field
from datetime import datetime

class ProductFilterDTO(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    search: Optional[str] = None
    category_id: Optional[int] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit

    def clean_search_query(self) -> str:
        if not self.search:
            return ""
        # Remove punctuation that could interfere with trigram search, keeping unicode letters and numbers
        cleaned = re.sub(r'[^\w\s]', ' ', self.search, flags=re.UNICODE)
        return " ".join(cleaned.split()).strip()

class ProductImageDTO(BaseModel):
    image_id: int
    image_url: str
    is_primary: bool
    display_order: int

    class Config:
        from_attributes = True

class ProductResponse(BaseModel):
    product_id: int
    category_id: Optional[int] = None
    name: str
    slug: str
    brand: str
    description: Optional[str] = None
    ingredients: Optional[str] = None
    price: Decimal
    stock_quantity: int
    is_active: bool
    images: List[ProductImageDTO] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaginatedProductsResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class ProductCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    slug: str = Field(..., min_length=2, max_length=280)
    brand: str = Field(..., min_length=1, max_length=100)
    category_id: Optional[int] = None
    description: Optional[str] = None
    ingredients: Optional[str] = None
    price: Decimal = Field(..., ge=0)
    stock_quantity: int = Field(..., ge=0)
    is_active: bool = True
    image_urls: List[str] = []

class ProductUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    slug: Optional[str] = Field(None, min_length=2, max_length=280)
    brand: Optional[str] = Field(None, min_length=1, max_length=100)
    category_id: Optional[int] = None
    description: Optional[str] = None
    ingredients: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
