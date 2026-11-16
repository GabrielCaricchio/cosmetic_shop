from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from Back.models.order_model import Order, OrderStatusEnum
from Back.models.product_model import Product
from Back.dtos.admin_dto import SalesMetricsDTO, DailySalesChartPoint

class ReportService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_sales_metrics(self) -> SalesMetricsDTO:
        now = datetime.now(timezone.utc)
        start_of_day = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)

        # 1. Total Daily Revenue (approved orders today)
        revenue_q = (
            select(func.coalesce(func.sum(Order.total_amount), 0))
            .where(
                Order.created_at >= start_of_day,
                Order.status == OrderStatusEnum.APPROVED
            )
        )
        rev_res = await self.session.execute(revenue_q)
        daily_revenue = Decimal(str(rev_res.scalar_one()))

        # 2. Total Orders Today
        orders_q = select(func.count(Order.order_id)).where(Order.created_at >= start_of_day)
        orders_res = await self.session.execute(orders_q)
        total_orders = orders_res.scalar_one()

        # 3. Critical stock items (<= 3 units available)
        stock_q = select(func.count(Product.product_id)).where(
            Product.is_active == True,
            Product.stock_quantity <= 3
        )
        stock_res = await self.session.execute(stock_q)
        critical_stock = stock_res.scalar_one()

        # 4. Conversion rate simulation
        conversion_rate = 4.2 if total_orders > 0 else 0.0

        return SalesMetricsDTO(
            daily_revenue=daily_revenue,
            total_orders_today=total_orders,
            conversion_rate=conversion_rate,
            critical_stock_count=critical_stock
        )

    async def get_daily_sales_chart(self, days: int = 7) -> List[DailySalesChartPoint]:
        chart: List[DailySalesChartPoint] = []
        now = datetime.now(timezone.utc)

        for i in range(days - 1, -1, -1):
            day = now - timedelta(days=i)
            day_str = day.strftime("%Y-%m-%d")
            start = datetime(day.year, day.month, day.day, tzinfo=timezone.utc)
            end = start + timedelta(days=1)

            q = (
                select(
                    func.coalesce(func.sum(Order.total_amount), 0),
                    func.count(Order.order_id)
                )
                .where(
                    Order.created_at >= start,
                    Order.created_at < end,
                    Order.status == OrderStatusEnum.APPROVED
                )
            )
            res = await self.session.execute(q)
            amt, count = res.one()

            chart.append(DailySalesChartPoint(
                date=day_str,
                amount=Decimal(str(amt)),
                orders_count=count
            ))

        return chart
