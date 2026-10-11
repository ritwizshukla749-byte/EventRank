import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import App from './App';

// Mock the API client
vi.mock('./api/client', () => ({
  api: {
    getHealth: vi.fn().mockResolvedValue({
      data: {
        status: 'ok',
        service: 'eventrank-api',
        version: '0.1.0',
        database: { status: 'connected' },
        uptimeSeconds: 10,
        timestamp: new Date().toISOString(),
      },
      meta: {},
    }),
  },
}));

describe('App Component', () => {
  it('renders the EventRank brand and dual score displays', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /EventRank/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Event Quality/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Fit for You/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Phase 0 Initialization Status/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/API: OK/i)).toBeInTheDocument();
    });
  });
});
