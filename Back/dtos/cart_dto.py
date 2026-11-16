from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel, Field

class CartItemDTO(BaseModel):
    product_id: int = Field(..., description="ID do produto no carrinho.", examples=[1])
    name: str = Field(..., description="Nome do cosmético.", examples=["Batom Matte Velvet Red"])
    price: Decimal = Field(..., description="Preço unitário em BRL.", examples=[49.90])
    quantity: int = Field(..., ge=1, description="Quantidade selecionada.", examples=[2])
    subtotal: Decimal = Field(..., description="Subtotal calculado (preço * quantidade).", examples=[99.80])
    image_url: Optional[str] = Field(None, description="URL da imagem principal.", examples=["https://images.unsplash.com/photo-1586495777744-4413f21062fa"])

class CartDTO(BaseModel):
    items: List[CartItemDTO] = Field(default=[], description="Lista de itens presentes no carrinho.")
    total_amount: Decimal = Field(default=Decimal("0.00"), description="Valor total acumulado dos itens no carrinho em BRL.", examples=[99.80])
    total_items: int = Field(default=0, description="Soma de todas as quantidades de itens no carrinho.", examples=[2])

    model_config = {
        "json_schema_extra": {
            "example": {
                "items": [
                    {
                        "product_id": 1,
                        "name": "Batom Matte Velvet Red",
                        "price": 49.90,
                        "quantity": 2,
                        "subtotal": 99.80,
                        "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa"
                    }
                ],
                "total_amount": 99.80,
                "total_items": 2
            }
        }
    }

class AddCartItemRequest(BaseModel):
    product_id: int = Field(..., description="ID do cosmético a ser adicionado ao carrinho.", examples=[1])
    quantity: int = Field(default=1, ge=1, description="Quantidade a ser incrementada.", examples=[1])

    model_config = {
        "json_schema_extra": {
            "example": {
                "product_id": 1,
                "quantity": 1
            }
        }
    }

class UpdateCartItemRequest(BaseModel):
    quantity: int = Field(..., ge=1, description="Nova quantidade desejada para o item no carrinho.", examples=[3])

    model_config = {
        "json_schema_extra": {
            "example": {
                "quantity": 3
            }
        }
    }
