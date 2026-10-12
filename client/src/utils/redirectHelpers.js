/**
 * Build login URL with redirect parameter
 * @param {string} intendedPath - Path to redirect to after login
 * @returns {string} Login URL with encoded redirect parameter
 */
export const buildLoginUrl = (intendedPath) => {
  if (!intendedPath || typeof intendedPath !== 'string') {
    return '/login';
  }

  const encodedPath = encodeURIComponent(intendedPath);
  return `/login?redirect=${encodedPath}`;
};

/**
 * Build register URL with redirect parameter
 * @param {string} intendedPath - Path to redirect to after registration
 * @returns {string} Register URL with encoded redirect parameter
 */
export const buildRegisterUrl = (intendedPath) => {
  if (!intendedPath || typeof intendedPath !== 'string') {
    return '/register';
  }

  const encodedPath = encodeURIComponent(intendedPath);
  return `/register?redirect=${encodedPath}`;
};

/**
 * Validate redirect path for security
 * @param {string} path - Path to validate
 * @returns {boolean} True if path is valid and safe
 */
export const isValidRedirect = (path) => {
  if (!path || typeof path !== 'string') {
    return false;
  }

  // Must start with / (internal path)
  if (!path.startsWith('/')) {
    return false;
  }

  // Reject paths that try to navigate to external URLs
  if (path.includes('://') || path.startsWith('//')) {
    return false;
  }

  // Reject dangerous paths
  const dangerous = ['javascript:', 'data:', 'vbscript:'];
  if (dangerous.some(prefix => path.toLowerCase().startsWith(prefix))) {
    return false;
  }

  return true;
};

/**
 * Get safe redirect path from URL search params
 * @param {URLSearchParams} searchParams - URL search parameters
 * @param {string} fallback - Fallback path if redirect is invalid (default: '/')
 * @returns {string} Validated redirect path or fallback
 */
export const getSafeRedirectPath = (searchParams, fallback = '/') => {
  const redirect = searchParams.get('redirect');
  
  if (!redirect) {
    return fallback;
  }

  if (isValidRedirect(redirect)) {
    return redirect;
  }

  console.warn('Invalid redirect path rejected:', redirect);
  return fallback;
};
