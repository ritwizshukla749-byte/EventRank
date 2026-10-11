import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext(null);
const STORAGE_KEY = 'eventrank_compare_events';

export function CompareProvider({ children }) {
  const [selectedEvents, setSelectedEvents] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selectedEvents));
    } catch (e) {
      console.error('Failed to save compare events in session', e);
    }
  }, [selectedEvents]);

  const addEvent = (event) => {
    if (selectedEvents.some((e) => e._id === event._id)) return;
    if (selectedEvents.length >= 3) return;
    setSelectedEvents((prev) => [...prev, event]);
  };

  const removeEvent = (eventId) => {
    setSelectedEvents((prev) => prev.filter((e) => e._id !== eventId));
  };

  const toggleEvent = (event) => {
    if (selectedEvents.some((e) => e._id === event._id)) {
      removeEvent(event._id);
    } else {
      addEvent(event);
    }
  };

  const clearAll = () => {
    setSelectedEvents([]);
  };

  const isSelected = (eventId) => {
    return selectedEvents.some((e) => e._id === eventId);
  };

  const canAddMore = selectedEvents.length < 3;

  const value = {
    selectedEvents,
    addEvent,
    removeEvent,
    toggleEvent,
    clearAll,
    isSelected,
    canAddMore,
    count: selectedEvents.length,
  };

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
