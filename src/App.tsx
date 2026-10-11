import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { UpdatePrompt } from '@/components/layout/UpdatePrompt';
import { AuthProvider } from '@/context/AuthProvider';
import { ToastProvider } from '@/context/ToastProvider';
import { useTheme } from '@/hooks/useTheme';
import { isSupabaseConfigured } from '@/lib/supabase';
import { LoginPage } from '@/pages/LoginPage';
import { OverviewPage } from '@/pages/OverviewPage';
import { SetupHintPage } from '@/pages/SetupHintPage';

/** @brief Module page incl. Markdown renderer, loaded on first visit (own chunk). */
const ModulePage = lazy(() =>
  import('@/pages/ModulePage').then((module) => ({ default: module.ModulePage })),
);

/**
 * @brief Root component: providers, routes and global overlays.
 * @returns The rendered application.
 */
export default function App() {
  useTheme(); // applies the stored appearance and follows system changes
  return (
    <ToastProvider>
      {isSupabaseConfigured ? (
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<OverviewPage />} />
                <Route
                  path="/module/:id"
                  element={
                    <Suspense fallback={<div className="min-h-dvh" aria-busy="true" />}>
                      <ModulePage />
                    </Suspense>
                  }
                />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      ) : (
        <SetupHintPage />
      )}
      <OfflineBanner />
      <UpdatePrompt />
    </ToastProvider>
  );
}
