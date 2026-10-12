/**
 * savedEventsApi - API module for saved events (bookmarks)
 * Backend requirement: /saved-events endpoints
 */

import { apiClient } from './client';

/**
 * List all saved events for the current authenticated user
 * @returns {Promise<{savedEvents: Array<SavedEvent>}>}
 */
export const list = async () => {
  const response = await apiClient.get('/saved-events');
  return response.data;
};

/**
 * Save (bookmark) an event edition
 * @param {string} editionId - Event edition ID to save
 * @returns {Promise<{savedEvent: SavedEvent}>}
 */
export const save = async (editionId) => {
  const response = await apiClient.post('/saved-events', { editionId });
  return response.data;
};

/**
 * Remove (unbookmark) a saved event
 * @param {string} editionId - Event edition ID to remove
 * @returns {Promise<{message: string}>}
 */
export const remove = async (editionId) => {
  const response = await apiClient.delete(`/saved-events/${editionId}`);
  return response.data;
};

/**
 * Check if event is saved
 * @param {string} editionId - Event edition ID
 * @returns {Promise<{isSaved: boolean}>}
 */
export const checkStatus = async (editionId) => {
  const response = await apiClient.get(`/saved-events/${editionId}/status`);
  return response.data;
};

/**
 * Batch check saved status for multiple events
 * @param {Array<string>} editionIds - Array of event edition IDs
 * @returns {Promise<{savedStatus: {[editionId: string]: boolean}}>}
 */
export const batchCheckStatus = async (editionIds) => {
  const response = await apiClient.post('/saved-events/batch-status', { editionIds });
  return response.data;
};

export const savedEventsApi = {
  list,
  save,
  remove,
  checkStatus,
  batchCheckStatus,
};
