import { ToastContainer } from '@/components/ui';
import { useUIStore } from '@/stores';
import AppRoutes from '@/routes';

export default function App() {
  const { toasts, removeToast } = useUIStore();

  return (
    <>
      <AppRoutes />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}