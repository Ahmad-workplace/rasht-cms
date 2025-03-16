import { useToastStore, ToastType } from '@/stores/toastStore';

export const useToast = () => {
  const { addToast } = useToastStore();

  const showToast = (message: string, type: ToastType = 'info', duration = 5000) => {
    addToast({
      message,
      type,
      duration,
      autoClose: true,
    });
  };

  return {
    showToast,
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'info'),
  };
};

export default useToast;