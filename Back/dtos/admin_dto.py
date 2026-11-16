from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel

class SalesMetricsDTO(BaseModel):
    daily_revenue: Decimal
    total_orders_today: int
    conversion_rate: float
    critical_stock_count: int

class DailySalesChartPoint(BaseModel):
    date: str
    amount: Decimal
    orders_count: int

class StockReservationItemDTO(BaseModel):
    order_id: str
    product_id: int
    quantity: int
    ttl_remaining: int

class UpdateOrderStatusRequest(BaseModel):
    status: str
