import { Toast } from './Toast';

export const ToastContainer = ({ toasts, onDismiss }) => {
  // Limit to max 3 visible toasts
  const visibleToasts = toasts.slice(-3);

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-md:left-4 max-md:right-4"
      aria-label="Notifications"
    >
      <div className="pointer-events-auto flex flex-col gap-2">
        {visibleToasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            variant={toast.variant}
            duration={toast.duration}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
};
