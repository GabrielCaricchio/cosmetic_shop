from typing import Any, Optional
from pydantic import BaseModel, Field

class ErrorResponseDTO(BaseModel):
    """Modelo padrão para respostas de erro da API Aura Cosméticos."""
    error: str = Field(
        ...,
        description="Código padronizado do erro em maiúsculas (ex: BAD_REQUEST, NOT_FOUND, OUT_OF_STOCK, UNAUTHORIZED, FORBIDDEN, CONFLICT).",
        examples=["NOT_FOUND"]
    )
    message: str = Field(
        ...,
        description="Mensagem descritiva e amigável em português para exibição ou log.",
        examples=["Produto 42 não encontrado"]
    )
    details: Optional[Any] = Field(
        None,
        description="Informações complementares, validações de campos ou rastreamento interno de erro.",
        examples=[{"field": "product_id", "issue": "Produto inativo ou inexistente"}]
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "error": "OUT_OF_STOCK",
                    "message": "Estoque esgotado para o produto 'Batom Matte Red Velvet'.",
                    "details": {"product_id": 1, "requested": 3, "available": 0}
                },
                {
                    "error": "UNAUTHORIZED",
                    "message": "Cabeçalho de autenticação ausente ou token inválido.",
                    "details": None
                },
                {
                    "error": "NOT_FOUND",
                    "message": "Recurso solicitado não foi encontrado no catálogo.",
                    "details": None
                }
            ]
        }
    }

# Dicionários reutilizáveis para documentar respostas comuns no FastAPI (responses={...})
COMMON_RESPONSES = {
    400: {
        "model": ErrorResponseDTO,
        "description": "Requisição inválida (parâmetros ausentes, formato incorreto ou regra de negócio violada)."
    },
    401: {
        "model": ErrorResponseDTO,
        "description": "Não autorizado (token JWT ausente, expirado ou assinatura inválida)."
    },
    403: {
        "model": ErrorResponseDTO,
        "description": "Acesso proibido (usuário autenticado não possui o papel/role necessário para este recurso)."
    },
    404: {
        "model": ErrorResponseDTO,
        "description": "Recurso não encontrado (produto, pedido, categoria ou carrinho inexistente)."
    },
    409: {
        "model": ErrorResponseDTO,
        "description": "Conflito de estado ou concorrência (ex: estoque esgotado via trava atômica Redis ou email já cadastrado)."
    },
    422: {
        "description": "Erro de validação semântica nos campos da requisição (Pydantic Validation Error)."
    }
}
