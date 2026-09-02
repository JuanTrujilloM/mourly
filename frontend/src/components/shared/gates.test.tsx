import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_USER, renderWithQuery, routerReplace } from '@/test-utils';
import * as authApi from '@/lib/api/auth';
import { AuthGate } from './AuthGate';
import { GuestGate } from './GuestGate';
import { AdminGate } from '@/components/admin/AdminGate';

vi.mock('@/lib/api/auth');

const fetchMe = vi.mocked(authApi.fetchMe);

describe('AuthGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loader while the session resolves', () => {
    fetchMe.mockReturnValue(new Promise(() => undefined));

    renderWithQuery(<AuthGate>{(user) => <p>{user.email}</p>}</AuthGate>);

    expect(screen.getByText(/Cargando tu sesión/i)).toBeInTheDocument();
  });

  it('hands the authenticated user to its children', async () => {
    fetchMe.mockResolvedValue(AUTH_USER);

    renderWithQuery(<AuthGate>{(user) => <p>{user.email}</p>}</AuthGate>);

    expect(await screen.findByText('ana@eafit.edu.co')).toBeInTheDocument();
  });

  it('redirects an anonymous visitor to register', async () => {
    fetchMe.mockRejectedValue(new Error('401'));

    renderWithQuery(<AuthGate>{() => <p>secreto</p>}</AuthGate>);

    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith('/register'));
    expect(screen.queryByText('secreto')).not.toBeInTheDocument();
  });
});

describe('GuestGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the guest content when nobody is signed in', async () => {
    fetchMe.mockRejectedValue(new Error('401'));

    renderWithQuery(
      <GuestGate>
        <p>formulario</p>
      </GuestGate>,
    );

    expect(await screen.findByText('formulario')).toBeInTheDocument();
  });

  it('sends an authenticated visitor to the dashboard', async () => {
    fetchMe.mockResolvedValue(AUTH_USER);

    renderWithQuery(
      <GuestGate>
        <p>formulario</p>
      </GuestGate>,
    );

    await waitFor(() =>
      expect(routerReplace).toHaveBeenCalledWith('/dashboard'),
    );
    expect(screen.queryByText('formulario')).not.toBeInTheDocument();
  });
});

describe('AdminGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the panel for an allowlisted admin', async () => {
    fetchMe.mockResolvedValue({ ...AUTH_USER, isAdmin: true });

    renderWithQuery(<AdminGate>{(user) => <p>{user.email}</p>}</AdminGate>);

    expect(await screen.findByText('ana@eafit.edu.co')).toBeInTheDocument();
  });

  it('bounces an authenticated non-admin to the dashboard', async () => {
    fetchMe.mockResolvedValue({ ...AUTH_USER, isAdmin: false });

    renderWithQuery(<AdminGate>{() => <p>panel</p>}</AdminGate>);

    await waitFor(() =>
      expect(routerReplace).toHaveBeenCalledWith('/dashboard'),
    );
    expect(screen.queryByText('panel')).not.toBeInTheDocument();
  });

  it('bounces an anonymous visitor to register', async () => {
    fetchMe.mockRejectedValue(new Error('401'));

    renderWithQuery(<AdminGate>{() => <p>panel</p>}</AdminGate>);

    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith('/register'));
    expect(screen.queryByText('panel')).not.toBeInTheDocument();
  });
});
