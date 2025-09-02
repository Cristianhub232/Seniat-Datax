import { useEffect, useState } from 'react';
import { IconX, IconCheck, IconAlertTriangle, IconCircle } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
  onDismiss: (id: string) => void;
}

export function Toast({ id, title, description, variant = 'default', duration = 5000, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(id), 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <IconAlertTriangle className="h-5 w-5 text-red-600" />;
      case 'success':
        return <IconCheck className="h-5 w-5 text-green-600" />;
      default:
        return <IconCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 w-96 max-w-sm rounded-lg border p-4 shadow-lg transition-all duration-300',
        getVariantStyles(),
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{title}</p>
          {description && (
            <p className="mt-1 text-sm opacity-90">{description}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => onDismiss(id)}
            className="inline-flex rounded-md p-1.5 opacity-70 hover:opacity-100 transition-opacity"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }: { toasts: any[], onDismiss: (id: string) => void }) {
  // Validar que toasts sea un array
  if (!toasts || !Array.isArray(toasts)) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
