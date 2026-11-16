import base64
import uuid
from decimal import Decimal
from datetime import datetime, timezone, timedelta
from typing import Tuple

class PaymentService:
    def generate_pix(self, order_id: str, amount: Decimal) -> Tuple[str, str, datetime]:
        """
        Generates simulated Pix QR Code (base64 PNG) and Pix Copy-and-Paste string.
        Returns: (pix_qr_code_base64, pix_copy_paste, expires_at)
        """
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
        formatted_amount = f"{amount:.2f}"
        
        # Standard EMVCo simulated string
        pix_copy_paste = (
            f"00020126580014br.gov.bcb.pix0136{order_id}"
            f"520400005303986540{len(formatted_amount):02d}{formatted_amount}"
            f"5802BR5925COSMETICOS MULTIMARCA6009SAO PAULO62070503***6304ABCD"
        )

        # 1x1 transparent PNG fallback encoded in base64 as representative QR image
        transparent_png_bytes = (
            b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
            b'\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4'
            b'\x00\x00\x00\x00IEND\xaeB`\x82'
        )
        pix_qr_code_base64 = "data:image/png;base64," + base64.b64encode(transparent_png_bytes).decode("utf-8")

        return pix_qr_code_base64, pix_copy_paste, expires_at
