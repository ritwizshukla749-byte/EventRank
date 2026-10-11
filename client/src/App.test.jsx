import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock the API client
vi.mock('./api/client', () => ({
  apiClient: vi.fn().mockImplementation((url) => {
    if (url.includes('/auth/me')) {
      return Promise.reject(new Error('Not logged in'));
    }
    if (url.includes('/events')) {
      return Promise.resolve({ events: [], total: 0 });
    }
    if (url.includes('/colleges')) {
      return Promise.resolve({ colleges: [] });
    }
    return Promise.resolve({});
  }),
}));

describe('EventRank Client Application', () => {
  it('renders discovery navigation header and title', async () => {
    render(<App />);
    expect(await screen.findByText('Discover')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /Discover Campus Events/i })).toBeInTheDocument();
  });
});
