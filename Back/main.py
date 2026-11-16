from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from Back.core.config import settings
from Back.core.exceptions import AppException
from Back.core.database import write_engine
from Back.core.redis_client import get_redis_client

# Routers
from Back.routers.auth_router import router as auth_router
from Back.routers.catalog_router import router as catalog_router
from Back.routers.cart_router import router as cart_router
from Back.routers.checkout_router import router as checkout_router
from Back.routers.order_router import router as order_router
from Back.routers.webhook_router import router as webhook_router
from Back.routers.support_router import router as support_router
from Back.routers.admin_auth_router import router as admin_auth_router
from Back.routers.admin_product_router import router as admin_product_router
from Back.routers.admin_order_router import router as admin_order_router
from Back.routers.admin_report_router import router as admin_report_router
from Back.routers.admin_inventory_router import router as admin_inventory_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup / check database extensions on startup if reachable
    try:
        async with write_engine.begin() as conn:
            await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
            await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "pg_trgm";'))
    except Exception:
        # In test or offline environment, gracefully proceed
        pass
    yield
    # Shutdown cleanup
    await write_engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API de E-Commerce de Cosméticos para Revendedoras com Alta Escala (FastAPI + Redis + pg_trgm)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Cart-ID", "Idempotency-Key"]
)

# Custom Exception Handler
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error_code,
            "message": exc.message,
            "details": exc.details
        }
    )

# Health Check
@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "cosmetics-ecommerce"}

# Mount Domain Routers
app.include_router(auth_router)
app.include_router(catalog_router)
app.include_router(cart_router)
app.include_router(checkout_router)
app.include_router(order_router)
app.include_router(webhook_router)
app.include_router(support_router)
app.include_router(admin_auth_router)
app.include_router(admin_product_router)
app.include_router(admin_order_router)
app.include_router(admin_report_router)
app.include_router(admin_inventory_router)
