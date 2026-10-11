import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Discover } from './Discover';
import { AuthProvider } from '../../context/AuthContext';
import { CompareProvider } from '../../context/CompareContext';
import { eventsApi } from '../../api/eventsApi';
import { collegesApi } from '../../api/featuresApi';

vi.mock('../../api/eventsApi', () => ({
  eventsApi: {
    list: vi.fn(),
  },
}));

vi.mock('../../api/featuresApi', () => ({
  collegesApi: {
    list: vi.fn(),
  },
}));

vi.mock('../../api/authApi', () => ({
  authApi: {
    me: vi.fn().mockRejectedValue(new Error('Unauthenticated')),
  },
}));

describe('Discover Page Rendering', () => {
  it('renders search input, filter dropdowns, and event cards properly', async () => {
    collegesApi.list.mockResolvedValue({
      colleges: [
        { _id: 'col-1', name: 'Apex Institute of Technology', slug: 'apex' },
        { _id: 'col-2', name: 'Metro State University', slug: 'metro-state' },
      ],
    });

    // Mock a single server-published event edition list item (GET /events contract)
    eventsApi.list.mockResolvedValue({
      events: [
        {
          _id: 'ed-1',
          editionLabel: 'Edition 1',
          event: {
            _id: 'ev-1',
            title: 'Apex Hackathon 2026',
            description: 'A 24-hour inter-college flagship hackathon.',
            eventType: 'hackathon',
            tags: ['AI', 'WebDev'],
          },
          hostCollege: { _id: 'col-1', name: 'Apex Institute of Technology', slug: 'apex', city: 'New Delhi' },
          organizer: { _id: 'org-1', name: 'Coding Club', type: 'club' },
          eligibility: {},
          startAt: '2026-11-15T09:00:00Z',
          endAt: '2026-11-16T09:00:00Z',
          timezone: 'UTC',
          venue: 'Main Auditorium',
          costAmount: 0,
          currency: 'USD',
          capacity: 100,
          registrationCount: 42,
          status: 'published',
          quality: {
            status: 'provisional',
            score: 86.4,
            confidence: 'medium',
            eligibleReviewCount: 3,
          },
          fit: {
            status: 'personalized',
            score: 91.2,
            isEligible: true,
            reasonCodes: ['interest_match'],
          },
          _meta: {},
        },
      ],
      _meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });

    render(
      <MemoryRouter initialEntries={['/discover']}>
        <AuthProvider>
          <CompareProvider>
            <Discover />
          </CompareProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Verify header and filter elements
    expect(screen.getByRole('heading', { name: /Discover campus events/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search events, courses/i)).toBeInTheDocument();
    expect(screen.getByText('All Colleges')).toBeInTheDocument();
    expect(screen.getByText('All Types')).toBeInTheDocument();

    // Verify college options load
    await waitFor(() => {
      expect(screen.getAllByText('Apex Institute of Technology').length).toBeGreaterThan(0);
      expect(screen.getByText('Metro State University')).toBeInTheDocument();
    });

    // Verify event card renders with title, real registration count, and separated scores
    await waitFor(() => {
      expect(screen.getAllByText('Apex Hackathon 2026').length).toBeGreaterThan(0);
      expect(screen.getByText('42 students')).toBeInTheDocument();
      expect(screen.getByText('EVENT QUALITY')).toBeInTheDocument();
      expect(screen.getByText('FIT FOR YOU')).toBeInTheDocument();
    });
  });

  it('renders EmptyState when no events match the search filter', async () => {
    collegesApi.list.mockResolvedValue({ colleges: [] });
    eventsApi.list.mockResolvedValue({ events: [], _meta: { total: 0 } });

    render(
      <MemoryRouter initialEntries={['/discover']}>
        <AuthProvider>
          <CompareProvider>
            <Discover />
          </CompareProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No events found')).toBeInTheDocument();
      expect(screen.getByText(/Try broadening your search/i)).toBeInTheDocument();
      expect(screen.getByText('Clear all filters')).toBeInTheDocument();
    });
  });
});