import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
} 