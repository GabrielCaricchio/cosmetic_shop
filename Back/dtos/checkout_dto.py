from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel, Field, EmailStr

class CustomerDTO(BaseModel):
    name: str = Field(..., description="Nome completo da cliente.", examples=["Maria Silva"])
    email: EmailStr = Field(..., description="E-mail de contato.", examples=["maria.silva@exemplo.com"])
    phone: Optional[str] = Field(None, description="Telefone / WhatsApp.", examples=["11987654321"])
    cpf: Optional[str] = Field(None, description="Número de CPF.", examples=["123.456.789-00"])
    lgpd_consent: bool = Field(True, description="Consentimento LGPD.", examples=[True])

class ShippingAddressDTO(BaseModel):
    street: str = Field(..., min_length=2, description="Logradouro / Rua / Avenida.", examples=["Avenida Paulista"])
    number: str = Field(..., description="Número predial ou residencial.", examples=["1000"])
    complement: Optional[str] = Field(None, description="Complemento (Apto, Bloco, Sala).", examples=["Apto 42B"])
    neighborhood: str = Field(..., description="Bairro.", examples=["Bela Vista"])
    city: str = Field(..., description="Cidade.", examples=["São Paulo"])
    state: str = Field(..., min_length=2, max_length=2, description="Sigla da Unidade Federativa (UF).", examples=["SP"])
    zip_code: str = Field(..., min_length=8, max_length=9, description="Código de Endereçamento Postal (CEP).", examples=["01310-100"])

    model_config = {
        "json_schema_extra": {
            "example": {
                "street": "Avenida Paulista",
                "number": "1000",
                "complement": "Apto 42B",
                "neighborhood": "Bela Vista",
                "city": "São Paulo",
                "state": "SP",
                "zip_code": "01310-100"
            }
        }
    }

class CheckoutItemDTO(BaseModel):
    product_id: int = Field(..., description="ID do produto.", examples=[1])
    quantity: int = Field(..., ge=1, description="Quantidade comprada.", examples=[2])

class CheckoutRequestDTO(BaseModel):
    items: List[CheckoutItemDTO] = Field(..., min_length=1, description="Lista de cosméticos para fechar o pedido.")
    shipping_address: ShippingAddressDTO = Field(..., description="Endereço de entrega completo.")
    payment_method: str = Field(default="pix", description="Método de pagamento ('pix' ou 'credit_card').", examples=["pix"])
    customer: Optional[CustomerDTO] = Field(None, description="Dados do cliente para checkout direto ou guest.")

    model_config = {
        "json_schema_extra": {
            "example": {
                "items": [
                    {"product_id": 1, "quantity": 2}
                ],
                "shipping_address": {
                    "street": "Avenida Paulista",
                    "number": "1000",
                    "complement": "Apto 42B",
                    "neighborhood": "Bela Vista",
                    "city": "São Paulo",
                    "state": "SP",
                    "zip_code": "01310-100"
                },
                "payment_method": "pix"
            }
        }
    }

class DirectCheckoutRequestDTO(BaseModel):
    product_id: int = Field(..., description="ID do produto para compra imediata (1-Click Buy Now).", examples=[1])
    quantity: int = Field(default=1, ge=1, description="Quantidade.", examples=[1])
    shipping_address: ShippingAddressDTO = Field(..., description="Endereço de entrega.")
    payment_method: str = Field(default="pix", description="Método de pagamento ('pix' ou 'credit_card').", examples=["pix"])

    model_config = {
        "json_schema_extra": {
            "example": {
                "product_id": 1,
                "quantity": 1,
                "shipping_address": {
                    "street": "Avenida Paulista",
                    "number": "1000",
                    "complement": "Apto 42B",
                    "neighborhood": "Bela Vista",
                    "city": "São Paulo",
                    "state": "SP",
                    "zip_code": "01310-100"
                },
                "payment_method": "pix"
            }
        }
    }

class CheckoutResponseDTO(BaseModel):
    order_id: str = Field(..., description="UUID identificador único do pedido gerado.", examples=["3fa85f64-5717-4562-b3fc-2c963f66afa6"])
    total_amount: Decimal = Field(..., description="Valor total consolidado do pedido em BRL.", examples=[99.80])
    status: str = Field(..., description="Status inicial do pedido ('pending').", examples=["pending"])
    payment_method: str = Field(..., description="Método de pagamento selecionado.", examples=["pix"])
    pix_qr_code_base64: Optional[str] = Field(None, description="Imagem do QR Code Pix em Base64 (Data URI) para leitura visual.")
    pix_copy_paste: Optional[str] = Field(None, description="Código Pix Copia e Cola (EMVCo) para pagamento no app do banco.", examples=["00020126580014br.gov.bcb.pix..."])
    expires_at: str = Field(..., description="Data/hora ISO 8601 de expiração do pagamento e reserva de estoque.", examples=["2026-11-16T09:15:00Z"])

    model_config = {
        "json_schema_extra": {
            "example": {
                "order_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                "total_amount": 99.80,
                "status": "pending",
                "payment_method": "pix",
                "pix_qr_code_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
                "pix_copy_paste": "00020126580014br.gov.bcb.pix01363fa85f64-5717-4562-b3fc-2c963f66afa65204000053039865400599.805802BR5925COSMETICOS MULTIMARCA6009SAO PAULO62070503***6304ABCD",
                "expires_at": "2026-11-16T09:15:00Z"
            }
        }
    }
