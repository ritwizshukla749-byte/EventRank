import { createContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/common/ToastContainer';

export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, variant = 'info', duration = 5000) => {
    const id = crypto.randomUUID();
    const toast = {
      id,
      message,
      variant,
      duration,
      timestamp: Date.now()
    };

    setToasts((prev) => [...prev, toast]);

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = {
    showToast,
    dismissToast,
    // Convenience methods
    success: useCallback((message, duration) => showToast(message, 'success', duration), [showToast]),
    error: useCallback((message, duration) => showToast(message, 'error', duration || 7000), [showToast]),
    warning: useCallback((message, duration) => showToast(message, 'warning', duration), [showToast]),
    info: useCallback((message, duration) => showToast(message, 'info', duration), [showToast])
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};
