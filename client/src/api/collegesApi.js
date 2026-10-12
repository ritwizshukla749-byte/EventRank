import { apiClient } from './client';

/**
 * Colleges API module
 * Handles fetching participating colleges for discovery and onboarding
 */
export const collegesApi = {
  /**
   * List all active participating colleges
   * @returns {Promise<{colleges: Array}>}
   */
  async list() {
    const response = await apiClient('/colleges');
    return response.data;
  },

  /**
   * Get single college by ID
   * @param {string} collegeId
   * @returns {Promise<{college: Object}>}
   */
  async getById(collegeId) {
    const response = await apiClient(`/colleges/${collegeId}`);
    return response.data;
  },
};
