import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { UpdatePrompt } from '@/components/layout/UpdatePrompt';
import { AuthProvider } from '@/context/AuthProvider';
import { ToastProvider } from '@/context/ToastProvider';
import { isSupabaseConfigured } from '@/lib/supabase';
import { LoginPage } from '@/pages/LoginPage';
import { ModulePage } from '@/pages/ModulePage';
import { OverviewPage } from '@/pages/OverviewPage';
import { SetupHintPage } from '@/pages/SetupHintPage';

/**
 * @brief Root component: providers, routes and global overlays.
 * @returns The rendered application.
 */
export default function App() {
  return (
    <ToastProvider>
      {isSupabaseConfigured ? (
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<OverviewPage />} />
                <Route path="/module/:id" element={<ModulePage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      ) : (
        <SetupHintPage />
      )}
      <UpdatePrompt />
    </ToastProvider>
  );
}
