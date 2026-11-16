from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from Back.core.database import get_read_db_session
from Back.core.dependencies import require_admin_role
from Back.services.report_service import ReportService
from Back.dtos.admin_dto import SalesMetricsDTO, DailySalesChartPoint
from Back.dtos.error_dto import COMMON_RESPONSES

router = APIRouter(prefix="/api/admin/reports", tags=["Admin Reports"])

def get_report_service(session: AsyncSession = Depends(get_read_db_session)) -> ReportService:
    return ReportService(session)

@router.get(
    "/sales",
    response_model=SalesMetricsDTO,
    status_code=status.HTTP_200_OK,
    summary="Obter indicadores consolidados de vendas (KPIs)",
    description="""
Gera métricas financeiras e operacionais em tempo real para o dashboard do administrador:
- Faturamento consolidado das últimas 24 horas (`daily_revenue`).
- Quantidade total de pedidos aprovados hoje (`total_orders_today`).
- Taxa média de conversão da loja (`conversion_rate`).
- Alerta de produtos com estoque crítico (`critical_stock_count` <= 3 unidades).
Exige autenticação administrativa.
""",
    responses={
        200: {
            "model": SalesMetricsDTO,
            "description": "Indicadores de vendas consolidados com sucesso."
        },
        401: COMMON_RESPONSES[401],
        403: COMMON_RESPONSES[403]
    }
)
async def get_sales_metrics(
    service: ReportService = Depends(get_report_service),
    _admin = Depends(require_admin_role())
):
    return await service.get_sales_metrics()

@router.get(
    "/sales/chart",
    response_model=list[DailySalesChartPoint],
    status_code=status.HTTP_200_OK,
    summary="Obter série temporal de evolução de vendas diárias",
    description="""
Gera os pontos cronológicos de vendas por dia (data, faturamento em BRL e contagem de pedidos) para renderização do gráfico de evolução no painel gerencial.
Exige autenticação administrativa.
""",
    responses={
        200: {
            "model": list[DailySalesChartPoint],
            "description": "Série temporal de vendas diárias calculada."
        },
        401: COMMON_RESPONSES[401],
        403: COMMON_RESPONSES[403],
        422: COMMON_RESPONSES[422]
    }
)
async def get_sales_chart(
    days: int = Query(7, ge=1, le=90, description="Janela de histórico em dias (máx. 90 dias).", examples=[7]),
    service: ReportService = Depends(get_report_service),
    _admin = Depends(require_admin_role())
):
    return await service.get_daily_sales_chart(days=days)
