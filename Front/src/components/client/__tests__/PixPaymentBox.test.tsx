import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PixPaymentBox } from '../PixPaymentBox';

describe('PixPaymentBox', () => {
  it('renders copy button and triggers clipboard copy', async () => {
    const mockCopy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText: mockCopy } });

    render(
      <PixPaymentBox
        qrCodeBase64="data:image/png;base64,iVBORw0KGgo..."
        copyPasteCode="00020126580014br.gov.bcb.pix..."
        expiresAt={new Date(Date.now() + 1800000).toISOString()}
      />
    );

    const copyBtn = screen.getByRole('button', { name: /copiar chave pix/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(mockCopy).toHaveBeenCalledWith('00020126580014br.gov.bcb.pix...');
  });
});
