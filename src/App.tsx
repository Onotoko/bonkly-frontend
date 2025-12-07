import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { ToastContainer } from '@/components/ui';
import { useUIStore, useAuthStore } from '@/stores';

export default function App() {
  const { toasts, removeToast } = useUIStore();
  const { setLoading } = useAuthStore();

  // Set loading to false on app mount
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}