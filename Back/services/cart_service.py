import json
from decimal import Decimal
from typing import Optional
import redis.asyncio as aioredis
from Back.repositories.product_repo import ProductRepository
from Back.dtos.cart_dto import CartDTO, CartItemDTO
from Back.core.exceptions import NotFoundException, OutOfStockException

CART_TTL = 7 * 24 * 3600  # 7 days

class CartService:
    def __init__(self, redis_client: aioredis.Redis, product_repo: ProductRepository):
        self.redis = redis_client
        self.product_repo = product_repo

    def _cart_key(self, cart_id: str) -> str:
        return f"cart:{cart_id}"

    async def get_cart(self, cart_id: str) -> CartDTO:
        key = self._cart_key(cart_id)
        raw_data = await self.redis.get(key)
        if not raw_data:
            return CartDTO()

        cart_data = json.loads(raw_data)
        items: list[CartItemDTO] = []
        total_amount = Decimal("0.00")
        total_items = 0

        for item_data in cart_data.get("items", []):
            product = await self.product_repo.get_by_id(item_data["product_id"])
            if not product or not product.is_active:
                continue  # Skip inactive or deleted product

            qty = min(item_data["quantity"], product.stock_quantity)
            if qty <= 0:
                continue

            subtotal = Decimal(str(product.price)) * qty
            total_amount += subtotal
            total_items += qty

            primary_img = next((img.image_url for img in product.images if img.is_primary), None)
            if not primary_img and product.images:
                primary_img = product.images[0].image_url

            items.append(CartItemDTO(
                product_id=product.product_id,
                name=product.name,
                price=product.price,
                quantity=qty,
                subtotal=subtotal,
                image_url=primary_img
            ))

        return CartDTO(items=items, total_amount=total_amount, total_items=total_items)

    async def add_item(self, cart_id: str, product_id: int, quantity: int) -> CartDTO:
        product = await self.product_repo.get_by_id(product_id)
        if not product or not product.is_active:
            raise NotFoundException(f"Produto {product_id} não encontrado")

        key = self._cart_key(cart_id)
        raw_data = await self.redis.get(key)
        cart_dict = json.loads(raw_data) if raw_data else {"items": []}

        # Check existing item
        existing = next((i for i in cart_dict["items"] if i["product_id"] == product_id), None)
        current_qty = existing["quantity"] if existing else 0
        new_qty = current_qty + quantity

        if new_qty > product.stock_quantity:
            raise OutOfStockException(
                f"Estoque insuficiente. Disponível: {product.stock_quantity}, solicitado: {new_qty}"
            )

        if existing:
            existing["quantity"] = new_qty
        else:
            cart_dict["items"].append({"product_id": product_id, "quantity": quantity})

        await self.redis.set(key, json.dumps(cart_dict), ex=CART_TTL)
        return await self.get_cart(cart_id)

    async def update_item_quantity(self, cart_id: str, product_id: int, quantity: int) -> CartDTO:
        product = await self.product_repo.get_by_id(product_id)
        if not product or not product.is_active:
            raise NotFoundException(f"Produto {product_id} não encontrado")

        if quantity > product.stock_quantity:
            raise OutOfStockException(
                f"Estoque insuficiente. Disponível: {product.stock_quantity}, solicitado: {quantity}"
            )

        key = self._cart_key(cart_id)
        raw_data = await self.redis.get(key)
        if not raw_data:
            return CartDTO()

        cart_dict = json.loads(raw_data)
        if quantity <= 0:
            cart_dict["items"] = [i for i in cart_dict["items"] if i["product_id"] != product_id]
        else:
            for item in cart_dict["items"]:
                if item["product_id"] == product_id:
                    item["quantity"] = quantity
                    break

        await self.redis.set(key, json.dumps(cart_dict), ex=CART_TTL)
        return await self.get_cart(cart_id)

    async def remove_item(self, cart_id: str, product_id: int) -> CartDTO:
        key = self._cart_key(cart_id)
        raw_data = await self.redis.get(key)
        if not raw_data:
            return CartDTO()

        cart_dict = json.loads(raw_data)
        cart_dict["items"] = [i for i in cart_dict["items"] if i["product_id"] != product_id]
        await self.redis.set(key, json.dumps(cart_dict), ex=CART_TTL)
        return await self.get_cart(cart_id)

    async def merge_guest_cart(self, guest_cart_id: str, client_id: int) -> CartDTO:
        guest_key = self._cart_key(guest_cart_id)
        client_cart_id = f"client_{client_id}"

        raw_guest = await self.redis.get(guest_key)
        if not raw_guest:
            return await self.get_cart(client_cart_id)

        guest_dict = json.loads(raw_guest)
        for item in guest_dict.get("items", []):
            try:
                await self.add_item(client_cart_id, item["product_id"], item["quantity"])
            except OutOfStockException:
                pass  # Merge best effort up to max stock

        await self.redis.delete(guest_key)
        return await self.get_cart(client_cart_id)
