import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminRouteGuard } from '../AdminRouteGuard';

describe('AdminRouteGuard', () => {
  it('redirects to /admin/login when user is not an administrator', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <AdminRouteGuard>
                <div>Admin Area</div>
              </AdminRouteGuard>
            }
          />
          <Route path="/admin/login" element={<div>Admin Login Screen</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/admin login screen/i)).toBeInTheDocument();
  });
});
