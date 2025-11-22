import { toast } from 'react-toastify';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export const showToast = (message: string, type: ToastType = 'info') => {
  const config = {
    success: {
      style: { background: '#4A148C', color: '#FFD700', fontWeight: 'bold' },
      progressStyle: { background: '#FFD700' },
    },
    error: {
      style: { background: '#E53935', color: '#FFFFFF', fontWeight: 'bold' },
      progressStyle: { background: '#FFFFFF' },
    },
    info: {
      style: { background: '#2196F3', color: '#FFFFFF', fontWeight: 'bold' },
      progressStyle: { background: '#FFFFFF' },
    },
    warning: {
      style: { background: '#FFD700', color: '#4A148C', fontWeight: 'bold' },
      progressStyle: { background: '#4A148C' },
    },
  };

  toast[type](message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...config[type]
  });
};
