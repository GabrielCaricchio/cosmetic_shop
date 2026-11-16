import json
import uuid
from decimal import Decimal
from typing import Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis
from Back.repositories.order_repo import OrderRepository
from Back.repositories.product_repo import ProductRepository
from Back.repositories.payment_repo import PaymentRepository
from Back.services.stock_lock_service import StockLockService
from Back.services.payment_service import PaymentService
from Back.models.order_model import Order, OrderStatusEnum
from Back.models.order_item_model import OrderItem
from Back.models.payment_model import Payment, PaymentMethodEnum
from Back.dtos.checkout_dto import CheckoutRequestDTO, CheckoutResponseDTO
from Back.core.exceptions import OutOfStockException, NotFoundException, ConflictException

IDEMPOTENCY_TTL = 24 * 3600  # 24 hours

class CheckoutService:
    def __init__(
        self,
        db: AsyncSession,
        redis_client: aioredis.Redis,
        stock_lock: StockLockService,
        payment_svc: PaymentService,
        order_repo: Optional[OrderRepository] = None,
        product_repo: Optional[ProductRepository] = None,
        payment_repo: Optional[PaymentRepository] = None
    ):
        self.db = db
        self.redis = redis_client
        self.stock_lock = stock_lock
        self.payment_svc = payment_svc
        self.order_repo = order_repo or OrderRepository(db)
        self.product_repo = product_repo or ProductRepository(db)
        self.payment_repo = payment_repo or PaymentRepository(db)

    async def check_idempotency(self, idempotency_key: str) -> Optional[dict]:
        key = f"idempotency:{idempotency_key}"
        cached = await self.redis.get(key)
        if cached:
            return json.loads(cached)
        return None

    async def process_checkout(
        self,
        client_id: int,
        request: CheckoutRequestDTO,
        idempotency_key: str
    ) -> CheckoutResponseDTO:
        # 1. Idempotency check
        cached_result = await self.check_idempotency(idempotency_key)
        if cached_result:
            return CheckoutResponseDTO(**cached_result)

        order_id = uuid.uuid4()
        order_id_str = str(order_id)
        locked_items: list[tuple[int, int]] = []

        total_amount = Decimal("0.00")
        order_items_to_create = []

        # 2. Acquire atomic stock locks via Redis
        try:
            for item in request.items:
                product = await self.product_repo.get_by_id(item.product_id)
                if not product or not product.is_active:
                    raise NotFoundException(f"Produto {item.product_id} não encontrado")

                # Ensure stock is initialized in Redis
                await self.stock_lock.init_stock(product.product_id, product.stock_quantity)

                acquired = await self.stock_lock.acquire_stock_lock(
                    order_id=order_id_str,
                    product_id=product.product_id,
                    quantity=item.quantity,
                    ttl_seconds=1800
                )
                if not acquired:
                    raise OutOfStockException(
                        f"Estoque esgotado para o produto '{product.name}'."
                    )
                locked_items.append((product.product_id, item.quantity))

                unit_price = Decimal(str(product.price))
                subtotal = unit_price * item.quantity
                total_amount += subtotal

                order_items_to_create.append(OrderItem(
                    order_id=order_id,
                    product_id=product.product_id,
                    quantity=item.quantity,
                    unit_price=unit_price,
                    subtotal=subtotal
                ))

            # 3. Create Order in Database
            order = Order(
                order_id=order_id,
                client_id=client_id,
                total_amount=total_amount,
                status=OrderStatusEnum.PENDING,
                shipping_address=request.shipping_address.model_dump(),
                idempotency_key=idempotency_key,
                items=order_items_to_create
            )
            await self.order_repo.create(order)

            # 4. Generate Pix Payment
            qr_base64, copy_paste, expires_at = self.payment_svc.generate_pix(
                order_id_str,
                total_amount
            )

            payment = Payment(
                order_id=order_id,
                method=PaymentMethodEnum.PIX,
                gateway="mercadopago",
                gateway_transaction_id=f"tx_{order_id_str[:8]}",
                pix_qr_code_base64=qr_base64,
                pix_copy_paste=copy_paste,
                amount=total_amount,
                status="pending",
                expires_at=expires_at
            )
            await self.payment_repo.create(payment)

            response_dto = CheckoutResponseDTO(
                order_id=order_id_str,
                total_amount=total_amount,
                status=OrderStatusEnum.PENDING.value,
                payment_method="pix",
                pix_qr_code_base64=qr_base64,
                pix_copy_paste=copy_paste,
                expires_at=expires_at.isoformat()
            )

            # Cache idempotency response
            await self.redis.set(
                f"idempotency:{idempotency_key}",
                response_dto.model_dump_json(),
                ex=IDEMPOTENCY_TTL
            )

            return response_dto

        except Exception as e:
            # Immediate rollback of any acquired locks
            for pid, _ in locked_items:
                await self.stock_lock.release_stock_lock(order_id_str, pid)
            raise e

    async def handle_payment_status_update(self, order_id: str, status: str) -> None:
        """Called by payment webhook to settle order or release locks."""
        try:
            parsed_order_id = uuid.UUID(order_id) if isinstance(order_id, str) else order_id
        except ValueError:
            parsed_order_id = order_id

        order = await self.order_repo.get_by_id(parsed_order_id)
        if not order:
            if status in ("rejected", "cancelled"):
                await self.stock_lock.release_all_locks_for_order(str(order_id))
            return

        if status == "approved":
            order.status = OrderStatusEnum.APPROVED
            # Permanently decrement DB stock
            for item in order.items:
                product = await self.product_repo.get_by_id(item.product_id)
                if product:
                    product.stock_quantity = max(0, product.stock_quantity - item.quantity)
                await self.stock_lock.commit_stock_lock(str(order.order_id), item.product_id)

        elif status in ("rejected", "cancelled"):
            order.status = (
                OrderStatusEnum.REJECTED if status == "rejected" else OrderStatusEnum.CANCELLED
            )
            await self.stock_lock.release_all_locks_for_order(str(order_id))
