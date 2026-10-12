import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from './LandingPage';
import { AuthContext } from '../../context/AuthContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LandingPage Component', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('renders hero with crisp campus image, centered serif headline, and pill action buttons', () => {
    const mockAuth = {
      user: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuth}>
          <LandingPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Hero headline and image
    expect(screen.getByRole('heading', { name: /Discover Campus Events/i })).toBeInTheDocument();
    expect(screen.getByText(/One connected view of/i)).toBeInTheDocument();
    expect(screen.getByText(/every campus event/i)).toBeInTheDocument();
    const heroImg = screen.getByAltText(/Collegiate campus architecture/i);
    expect(heroImg).toHaveAttribute('src', '/images/campus-hero.png');

    // Centered pill buttons
    expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /See Live Feed/i })).toBeInTheDocument();
  });

  it('opens sign-in modal on Get Started, submits login and directs user to feed', async () => {
    const mockLogin = vi.fn().mockResolvedValue({});
    const mockAuth = {
      user: null,
      isAuthenticated: false,
      login: mockLogin,
      logout: vi.fn(),
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuth}>
          <LandingPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Click "Get Started" to open sign in modal
    fireEvent.click(screen.getByRole('button', { name: /Get Started/i }));
    expect(screen.getByText(/Sign In to Your Feed/i)).toBeInTheDocument();

    const emailInput = screen.getByPlaceholderText('student@cascade.edu');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Sign In & Enter Feed/i });

    fireEvent.change(emailInput, { target: { value: 'alex.rivera@cascade.edu' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'alex.rivera@cascade.edu',
        password: 'Password123!',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/discover');
    });
  });

  it('supports 1-click demo login directly from hero and navigates to feed', async () => {
    const mockLogin = vi.fn().mockResolvedValue({});
    const mockAuth = {
      user: null,
      isAuthenticated: false,
      login: mockLogin,
      logout: vi.fn(),
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuth}>
          <LandingPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const studentDemoBtn = screen.getByRole('button', { name: /Alex Rivera/i });
    fireEvent.click(studentDemoBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'alex.rivera@cascade.edu',
        password: 'Password123!',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/discover');
    });
  });

  it('renders "Go to Your Feed" pill when already authenticated and directs on click', () => {
    const mockAuth = {
      user: { name: 'Alex Rivera', collegeRole: 'student', college: { name: 'Cascade Polytechnic' } },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuth}>
          <LandingPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const feedBtn = screen.getByRole('button', { name: /Go to Your Feed/i });
    expect(feedBtn).toBeInTheDocument();

    fireEvent.click(feedBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/discover');
  });
});
