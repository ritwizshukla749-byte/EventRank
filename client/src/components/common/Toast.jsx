import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useEffect } from 'react';

const variantConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    iconColor: 'text-emerald-500'
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    iconColor: 'text-red-500'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
    iconColor: 'text-amber-500'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    iconColor: 'text-blue-500'
  }
};

export const Toast = ({ id, message, variant = 'info', duration = 5000, onDismiss }) => {
  const config = variantConfig[variant] || variantConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onDismiss(id);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [id, onDismiss]);

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border
        ${config.bgColor} ${config.borderColor}
        backdrop-blur-sm shadow-lg
        w-full max-w-sm
        animate-slide-in
      `}
    >
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      
      <p className={`flex-1 text-sm font-medium ${config.textColor}`}>
        {message}
      </p>

      <button
        onClick={() => onDismiss(id)}
        className={`
          flex-shrink-0 p-1 rounded-md transition-colors
          ${config.textColor} hover:bg-white/10
          focus:outline-none focus:ring-2 focus:ring-white/50
        `}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};
