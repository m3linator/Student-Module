import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { UpdatePrompt } from '@/components/layout/UpdatePrompt';
import { AuthProvider } from '@/context/AuthProvider';
import { isSupabaseConfigured } from '@/lib/supabase';
import { LoginPage } from '@/pages/LoginPage';
import { OverviewPage } from '@/pages/OverviewPage';
import { SetupHintPage } from '@/pages/SetupHintPage';

/**
 * @brief Root component: providers, routes and global overlays.
 * @returns The rendered application.
 */
export default function App() {
  return (
    <>
      {isSupabaseConfigured ? (
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<OverviewPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      ) : (
        <SetupHintPage />
      )}
      <UpdatePrompt />
    </>
  );
}
