import urllib.parse
from typing import Optional
from fastapi import APIRouter, Query, status
from fastapi.responses import RedirectResponse
from Back.core.config import settings

router = APIRouter(prefix="/api", tags=["Support"])

@router.get("/whatsapp-redirect", status_code=status.HTTP_307_TEMPORARY_REDIRECT)
async def whatsapp_redirect(
    product_name: Optional[str] = Query(None),
    order_id: Optional[str] = Query(None)
):
    phone = settings.WHATSAPP_SUPPORT_PHONE
    if order_id:
        message = f"Olá! Preciso de ajuda com meu pedido #{order_id} no e-commerce de cosméticos."
    elif product_name:
        message = f"Olá! Tenho uma dúvida sobre o cosmético '{product_name}'."
    else:
        message = "Olá! Gostaria de atendimento sobre a loja de cosméticos."

    encoded_msg = urllib.parse.quote(message)
    target_url = f"https://wa.me/{phone}?text={encoded_msg}"
    return RedirectResponse(url=target_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)
