from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from Back.core.database import get_read_db_session
from Back.core.dependencies import require_admin_role
from Back.services.report_service import ReportService
from Back.dtos.admin_dto import SalesMetricsDTO, DailySalesChartPoint

router = APIRouter(prefix="/api/admin/reports", tags=["Admin Reports"])

def get_report_service(session: AsyncSession = Depends(get_read_db_session)) -> ReportService:
    return ReportService(session)

@router.get("/sales", response_model=SalesMetricsDTO)
async def get_sales_metrics(
    service: ReportService = Depends(get_report_service),
    _admin = Depends(require_admin_role())
):
    return await service.get_sales_metrics()

@router.get("/sales/chart", response_model=list[DailySalesChartPoint])
async def get_sales_chart(
    days: int = 7,
    service: ReportService = Depends(get_report_service),
    _admin = Depends(require_admin_role())
):
    return await service.get_daily_sales_chart(days=days)
