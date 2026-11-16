from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel, Field

class SalesMetricsDTO(BaseModel):
    daily_revenue: Decimal = Field(..., description="Faturamento consolidado das últimas 24 horas em BRL.", examples=[14850.50])
    total_orders_today: int = Field(..., description="Contagem total de pedidos aprovados hoje.", examples=[142])
    conversion_rate: float = Field(..., description="Taxa de conversão de checkout (pedidos pagos / iniciados).", examples=[4.85])
    critical_stock_count: int = Field(..., description="Quantidade de cosméticos com estoque crítico (<= 3 unidades).", examples=[5])
    total_revenue: Optional[Decimal] = Field(None, description="Alias para daily_revenue.")
    total_orders: Optional[int] = Field(None, description="Alias para total_orders_today.")
    average_ticket: Optional[Decimal] = Field(None, description="Ticket médio calculado em BRL.")

    model_config = {
        "json_schema_extra": {
            "example": {
                "daily_revenue": 14850.50,
                "total_orders_today": 142,
                "conversion_rate": 4.85,
                "critical_stock_count": 5
            }
        }
    }

class DailySalesChartPoint(BaseModel):
    date: str = Field(..., description="Data no formato AAAA-MM-DD.", examples=["2026-11-16"])
    amount: Decimal = Field(..., description="Volume financeiro transacionado no dia em BRL.", examples=[12340.00])
    orders_count: int = Field(..., description="Número de pedidos fechados no dia.", examples=[115])

class StockReservationItemDTO(BaseModel):
    order_id: str = Field(..., description="UUID do pedido que detém a reserva no Redis.", examples=["3fa85f64-5717-4562-b3fc-2c963f66afa6"])
    product_id: int = Field(..., description="ID do produto reservado.", examples=[1])
    quantity: int = Field(..., description="Quantidade de unidades bloqueadas temporariamente.", examples=[2])
    ttl_remaining: int = Field(..., description="Tempo de vida restante da trava atômica em segundos (máx. 1800s).", examples=[1432])
    key: Optional[str] = Field(None, description="Chave completa do Redis para liberação manual.", examples=["stock:reserved:3fa85f64:1"])
    product_name: Optional[str] = Field(None, description="Nome do produto reservado.", examples=["Batom Matte Velvet Red"])
    reserved_quantity: Optional[int] = Field(None, description="Quantidade reservada para exibição.", examples=[2])
    ttl_remaining_seconds: Optional[int] = Field(None, description="TTL restante em segundos.", examples=[1432])

class UpdateOrderStatusRequest(BaseModel):
    status: str = Field(
        ...,
        description="Novo status logístico do pedido ('paid', 'preparing', 'shipped', 'delivered', 'cancelled').",
        examples=["shipped"]
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "shipped"
            }
        }
    }
