import pytest
from Back.dtos.admin_dto import SalesMetricsDTO

def test_sales_metrics_dto():
    metrics = SalesMetricsDTO(
        daily_revenue=4820.50,
        total_orders_today=34,
        conversion_rate=4.2,
        critical_stock_count=3
    )
    assert metrics.daily_revenue == 4820.50
    assert metrics.critical_stock_count == 3
