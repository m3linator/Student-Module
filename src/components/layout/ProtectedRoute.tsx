import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/hooks/useAuth';

/**
 * @brief Route guard: renders child routes only for signed-in users.
 * @returns Nested routes, a neutral blank screen while the session loads, or a redirect to /login.
 */
export function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-dvh bg-white" aria-busy="true" />;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
