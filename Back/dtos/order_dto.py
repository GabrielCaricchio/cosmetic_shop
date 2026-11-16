from typing import List, Optional, Any
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class OrderItemDetailDTO(BaseModel):
    product_id: int = Field(..., description="ID do cosmético comprado.", examples=[1])
    product_name: str = Field(..., description="Nome do produto no momento da compra.", examples=["Batom Matte Velvet Red"])
    quantity: int = Field(..., description="Quantidade adquirida.", examples=[2])
    unit_price: Decimal = Field(..., description="Preço unitário congelado na data do pedido.", examples=[49.90])
    subtotal: Decimal = Field(..., description="Subtotal do item (unit_price * quantity).", examples=[99.80])

class OrderDetailResponse(BaseModel):
    order_id: str = Field(..., description="UUID do pedido.", examples=["3fa85f64-5717-4562-b3fc-2c963f66afa6"])
    client_id: int = Field(..., description="ID da cliente compradora.", examples=[1])
    total_amount: Decimal = Field(..., description="Valor total do pedido em BRL.", examples=[99.80])
    status: str = Field(..., description="Status atual no ciclo de vida (pending, paid, preparing, shipped, delivered, cancelled).", examples=["pending"])
    shipping_address: dict[str, Any] = Field(..., description="Endereço de entrega registrado no pedido.")
    items: List[OrderItemDetailDTO] = Field(default=[], description="Lista de cosméticos inclusos no pedido.")
    payment_method: Optional[str] = Field(None, description="Método de pagamento ('pix' ou 'credit_card').", examples=["pix"])
    pix_qr_code_base64: Optional[str] = Field(None, description="QR Code Pix caso o pagamento esteja pendente.")
    pix_copy_paste: Optional[str] = Field(None, description="Código Pix Copia e Cola para pagamento.")
    created_at: datetime = Field(..., description="Data e hora de emissão do pedido.")
    updated_at: datetime = Field(..., description="Data e hora da última alteração de status.")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "order_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                "client_id": 1,
                "total_amount": 99.80,
                "status": "pending",
                "shipping_address": {
                    "street": "Avenida Paulista",
                    "number": "1000",
                    "complement": "Apto 42B",
                    "neighborhood": "Bela Vista",
                    "city": "São Paulo",
                    "state": "SP",
                    "zip_code": "01310-100"
                },
                "items": [
                    {
                        "product_id": 1,
                        "product_name": "Batom Matte Velvet Red",
                        "quantity": 2,
                        "unit_price": 49.90,
                        "subtotal": 99.80
                    }
                ],
                "payment_method": "pix",
                "pix_qr_code_base64": "data:image/png;base64,...",
                "pix_copy_paste": "00020126580014br.gov.bcb.pix...",
                "created_at": "2026-11-16T08:00:00Z",
                "updated_at": "2026-11-16T08:00:00Z"
            }
        }
    )
