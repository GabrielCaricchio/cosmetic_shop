import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';

describe('Button component', () => {
  it('renders children and responds to click', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Comprar Agora</Button>);
    fireEvent.click(screen.getByRole('button', { name: /comprar agora/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and displays spinner when isLoading is true', () => {
    render(<Button isLoading>Processando</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
