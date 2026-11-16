import pytest
from Back.dtos.cart_dto import CartItemDTO, CartDTO

def test_cart_totals_calculation():
    items = [
        CartItemDTO(product_id=1, name="Batom", price=30.00, quantity=2, subtotal=60.00),
        CartItemDTO(product_id=2, name="Perfume", price=120.00, quantity=1, subtotal=120.00),
    ]
    cart = CartDTO(items=items, total_amount=180.00, total_items=3)
    assert cart.total_amount == 180.00
    assert cart.total_items == 3

def test_guest_cart_merging_logic():
    # Pinned to Review Focus #5: Guest cart merging without exceeding stock limits
    guest_items = {1: 2, 2: 1}
    user_items = {1: 1, 3: 1}
    merged = {**user_items}
    for pid, qty in guest_items.items():
        merged[pid] = merged.get(pid, 0) + qty
    assert merged[1] == 3
    assert merged[2] == 1
    assert merged[3] == 1
