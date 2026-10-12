const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export class ApiError extends Error {
  constructor(code, message, details = [], status = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export async function apiClient(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Add Authorization header if token exists in localStorage
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Still include for cookie fallback
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data?.error || {
      code: 'HTTP_ERROR',
      message: response.statusText || 'Request failed',
      details: [],
    };
    throw new ApiError(error.code, error.message, error.details, response.status);
  }

  // If the response follows the standard { data, meta } envelope, unwrap data while attaching meta
  if (data && typeof data === 'object' && 'data' in data) {
    const unwrapped = data.data;
    if (unwrapped && typeof unwrapped === 'object' && !Array.isArray(unwrapped) && data.meta) {
      unwrapped._meta = data.meta;
    }
    return unwrapped;
  }

  return data;
}

export const api = {
  getHealth: () => apiClient('/health'),
};
