import { apiClient } from './client';

const SORT_ENUM = ['upcoming', 'cost_asc', 'cost_desc', 'date_desc', 'quality', 'fit'];

export const eventsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();

    const q = params.q || params.search;
    if (q) query.append('q', q);
    if (params.collegeId) query.append('collegeId', params.collegeId);
    if (params.organizerId) query.append('organizerId', params.organizerId);
    if (params.type) query.append('type', params.type);
    if (params.tags) query.append('tags', params.tags);
    if (params.minCost !== undefined && params.minCost !== '') query.append('minCost', params.minCost);
    if (params.maxCost !== undefined && params.maxCost !== '') query.append('maxCost', params.maxCost);
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);

    // Server sort enum: ['upcoming', 'cost_asc', 'cost_desc', 'date_desc', 'quality', 'fit']
    const selectedSort = params.sort || params.sortBy;
    if (SORT_ENUM.includes(selectedSort)) {
      query.append('sort', selectedSort);
    } else {
      query.append('sort', 'upcoming');
    }

    // Quality/Fit sorting and client score display need scored list items
    if (params.includeScores || ['quality', 'fit'].includes(selectedSort)) {
      query.append('includeScores', 'true');
    }

    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString();
    return apiClient(`/events${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => apiClient(`/events/${id}`),

  create: (eventData) =>
    apiClient('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),
};