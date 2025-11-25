import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from '@/components/ui';
import { useUIStore } from '@/stores';

const LoginPage = () => <div>Login Page</div>;
const HomePage = () => <div>Home Page</div>;

export default function App() {
  const { toasts, removeToast } = useUIStore();

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}