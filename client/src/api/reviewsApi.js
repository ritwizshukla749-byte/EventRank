import { apiClient } from './client';

/**
 * API methods for event reviews
 */
export const reviewsApi = {
  /**
   * List reviews for an event edition
   * @param {string} editionId - Event edition ID
   * @param {Object} params - Query parameters (page, limit, sort)
   * @returns {Promise<{data: {reviews: Array, meta: Object}}>}
   */
  list: (editionId, params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v != null)
    ).toString();
    return apiClient(`/event-editions/${editionId}/reviews${query ? '?' + query : ''}`);
  },

  /**
   * Check if current user can submit a review for this event
   * @param {string} editionId - Event edition ID
   * @returns {Promise<{data: {eligible: boolean, reasons: Array}}>}
   */
  checkEligibility: (editionId) => {
    return apiClient(`/event-editions/${editionId}/reviews/eligibility`);
  },

  /**
   * Submit a review for an event edition
   * @param {string} editionId - Event edition ID
   * @param {Object} reviewData - Review data (dimensions, text)
   * @returns {Promise<{data: {review: Object}}>}
   */
  submit: (editionId, reviewData) => {
    return apiClient(`/event-editions/${editionId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  },

  /**
   * Report a review for moderation
   * @param {string} reviewId - Review ID
   * @param {string} reason - Report reason
   * @returns {Promise<{data: {success: boolean}}>}
   */
  report: (reviewId, reason) => {
    return apiClient(`/reviews/${reviewId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }
};
