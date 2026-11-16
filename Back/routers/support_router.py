import urllib.parse
from typing import Optional
from fastapi import APIRouter, Query, status
from fastapi.responses import RedirectResponse
from Back.core.config import settings

router = APIRouter(prefix="/api", tags=["Support"])

@router.get(
    "/whatsapp-redirect",
    status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    summary="Redirecionar para atendimento humano no WhatsApp",
    description="""
Gera e redireciona (HTTP 307) a cliente diretamente para a conversa oficial no WhatsApp da Aura Cosméticos com mensagem contextual pré-preenchida:
- Com `order_id`: Gera mensagem informando o número do pedido para suporte logístico/pagamento.
- Com `product_name`: Gera mensagem com dúvida técnica ou dermatológica sobre o cosmético específico.
- Sem parâmetros: Inicia conversa com saudação geral de atendimento ao cliente.
""",
    responses={
        307: {
            "description": "Redirecionamento temporário para a API wa.me do WhatsApp com a mensagem codificada."
        }
    }
)
async def whatsapp_redirect(
    product_name: Optional[str] = Query(None, description="Nome do produto para tirar dúvidas de ingredientes ou aplicação.", examples=["Sérum Facial Vitamina C"]),
    order_id: Optional[str] = Query(None, description="UUID do pedido para dúvidas de entrega ou pagamento.", examples=["3fa85f64-5717-4562-b3fc-2c963f66afa6"])
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
