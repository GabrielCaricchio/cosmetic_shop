import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductModal } from '../ProductModal';

describe('ProductModal', () => {
  it('validates required fields before submitting', () => {
    const handleSave = vi.fn();
    render(<ProductModal isOpen={true} onClose={() => {}} onSave={handleSave} />);

    fireEvent.click(screen.getByRole('button', { name: /salvar cosmético/i }));
    expect(handleSave).not.toHaveBeenCalled();
    expect(screen.getByText(/nome do produto é obrigatório/i)).toBeInTheDocument();
  });
});
