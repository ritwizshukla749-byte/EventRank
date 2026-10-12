/**
 * useSavedEvents - Hook for managing saved events (bookmarks)
 * Provides optimistic UI updates and state synchronization
 */

import { useState, useCallback } from 'react';
import { savedEventsApi } from '../api/savedEventsApi';
import { useToast } from './useToast';

/**
 * Hook for managing saved events with optimistic updates
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @returns {Object} Saved events state and methods
 */
export function useSavedEvents(isAuthenticated = false) {
  const [savedEventIds, setSavedEventIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  /**
   * Check if an event is saved
   * @param {string} editionId - Event edition ID
   * @returns {boolean}
   */
  const isSaved = useCallback((editionId) => {
    return savedEventIds.has(editionId);
  }, [savedEventIds]);

  /**
   * Load saved events from API
   */
  const loadSavedEvents = useCallback(async () => {
    if (!isAuthenticated) {
      setSavedEventIds(new Set());
      return;
    }

    setIsLoading(true);
    try {
      const { savedEvents } = await savedEventsApi.list();
      const ids = new Set(savedEvents.map(se => se.editionId._id || se.editionId));
      setSavedEventIds(ids);
    } catch (err) {
      // Silent fail - having no saved events is a normal state
      // Only log to console, don't show error toast to user
      console.error('Failed to load saved events:', err);
      setSavedEventIds(new Set()); // Set empty set on error
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Toggle saved status for an event (optimistic update)
   * @param {string} editionId - Event edition ID
   * @param {string} eventTitle - Event title for toast message
   * @returns {Promise<boolean>} Success status
   */
  const toggleSaved = useCallback(async (editionId, eventTitle = 'Event') => {
    if (!isAuthenticated) {
      showError('Please sign in to save events');
      return false;
    }

    const wasSaved = savedEventIds.has(editionId);
    
    // Optimistic update
    setSavedEventIds(prev => {
      const newSet = new Set(prev);
      if (wasSaved) {
        newSet.delete(editionId);
      } else {
        newSet.add(editionId);
      }
      return newSet;
    });

    try {
      if (wasSaved) {
        await savedEventsApi.remove(editionId);
        showSuccess(`Removed "${eventTitle}" from saved events`);
      } else {
        await savedEventsApi.save(editionId);
        showSuccess(`Saved "${eventTitle}" to your bookmarks`);
      }
      return true;
    } catch (err) {
      // Revert optimistic update on error
      setSavedEventIds(prev => {
        const newSet = new Set(prev);
        if (wasSaved) {
          newSet.add(editionId);
        } else {
          newSet.delete(editionId);
        }
        return newSet;
      });
      
      showError(err.message || `Failed to ${wasSaved ? 'remove' : 'save'} event`);
      return false;
    }
  }, [isAuthenticated, savedEventIds, showSuccess, showError]);

  /**
   * Save an event (without toggle)
   * @param {string} editionId - Event edition ID
   * @param {string} eventTitle - Event title for toast message
   * @returns {Promise<boolean>}
   */
  const saveEvent = useCallback(async (editionId, eventTitle = 'Event') => {
    if (!isAuthenticated) {
      showError('Please sign in to save events');
      return false;
    }

    if (savedEventIds.has(editionId)) {
      return true; // Already saved
    }

    // Optimistic update
    setSavedEventIds(prev => new Set(prev).add(editionId));

    try {
      await savedEventsApi.save(editionId);
      showSuccess(`Saved "${eventTitle}" to your bookmarks`);
      return true;
    } catch (err) {
      // Revert
      setSavedEventIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(editionId);
        return newSet;
      });
      showError(err.message || 'Failed to save event');
      return false;
    }
  }, [isAuthenticated, savedEventIds, showSuccess, showError]);

  /**
   * Remove a saved event (without toggle)
   * @param {string} editionId - Event edition ID
   * @param {string} eventTitle - Event title for toast message
   * @returns {Promise<boolean>}
   */
  const removeEvent = useCallback(async (editionId, eventTitle = 'Event') => {
    if (!savedEventIds.has(editionId)) {
      return true; // Already removed
    }

    // Optimistic update
    setSavedEventIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(editionId);
      return newSet;
    });

    try {
      await savedEventsApi.remove(editionId);
      showSuccess(`Removed "${eventTitle}" from saved events`);
      return true;
    } catch (err) {
      // Revert
      setSavedEventIds(prev => new Set(prev).add(editionId));
      showError(err.message || 'Failed to remove event');
      return false;
    }
  }, [savedEventIds, showSuccess, showError]);

  /**
   * Batch load saved status for multiple events
   * @param {Array<string>} editionIds - Array of event edition IDs
   */
  const batchLoadStatus = useCallback(async (editionIds) => {
    if (!isAuthenticated || !editionIds.length) return;

    try {
      const { savedStatus } = await savedEventsApi.batchCheckStatus(editionIds);
      setSavedEventIds(prev => {
        const newSet = new Set(prev);
        Object.entries(savedStatus).forEach(([id, isSaved]) => {
          if (isSaved) {
            newSet.add(id);
          }
        });
        return newSet;
      });
    } catch (err) {
      console.error('Failed to batch load saved status:', err);
    }
  }, [isAuthenticated]);

  return {
    savedEventIds,
    isSaved,
    toggleSaved,
    saveEvent,
    removeEvent,
    loadSavedEvents,
    batchLoadStatus,
    isLoading,
  };
}
