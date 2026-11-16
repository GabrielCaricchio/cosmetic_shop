import pytest
from Back.models.order_model import OrderStatusEnum, Order
from Back.models.product_model import Product
from Back.models.payment_model import PaymentMethodEnum

def test_order_status_enum_values():
    assert OrderStatusEnum.PENDING.value == "pending"
    assert OrderStatusEnum.APPROVED.value == "approved"
    assert OrderStatusEnum.REJECTED.value == "rejected"
    assert OrderStatusEnum.CANCELLED.value == "cancelled"
    assert OrderStatusEnum.REFUNDED.value == "refunded"

def test_product_model_attributes():
    product = Product(
        name="Batom Matte Longa Duração",
        slug="batom-matte-longa-duracao",
        brand="Natura",
        price=39.90,
        stock_quantity=15,
        ingredients="Cera de abelha, pigmentos naturais, vitamina E"
    )
    assert product.brand == "Natura"
    assert product.stock_quantity == 15
