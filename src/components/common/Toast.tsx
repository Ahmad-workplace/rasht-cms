import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useToastStore } from '@/stores/toastStore';

const Toast: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.autoClose) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration || 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = toast.type === 'success' ? CheckCircle :
                    toast.type === 'error' ? AlertCircle : Info;

        return (
          <div
            key={toast.id}
            className={`flex items-center p-4 rounded-lg shadow-lg min-w-[300px] max-w-md transform transition-all duration-300 ease-in-out ${
              toast.type === 'success' ? 'bg-green-50 text-green-800' :
              toast.type === 'error' ? 'bg-red-50 text-red-800' :
              'bg-blue-50 text-blue-800'
            }`}
            role="alert"
          >
            <Icon className="h-5 w-5 ml-3 flex-shrink-0" />
            <div className="mr-3 flex-1 text-sm">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex text-gray-400 hover:text-gray-900 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;