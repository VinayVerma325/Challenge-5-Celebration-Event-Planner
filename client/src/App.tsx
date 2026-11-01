import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';

// Route-based lazy loading for optimal bundle size and Lighthouse efficiency
const LoginPage = lazy(() =>
  import('./pages/LoginPage.js').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage.js').then((m) => ({ default: m.RegisterPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage.js').then((m) => ({ default: m.DashboardPage }))
);
const EventsPage = lazy(() =>
  import('./pages/EventsPage.js').then((m) => ({ default: m.EventsPage }))
);
const EventDetailPage = lazy(() =>
  import('./pages/EventDetailPage.js').then((m) => ({ default: m.EventDetailPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage.js').then((m) => ({ default: m.NotFoundPage }))
);

const PageFallback: React.FC = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50">
    <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
    <p className="text-xs font-semibold text-slate-400 mt-3 animate-pulse">Loading Celebration Studio...</p>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageFallback />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-rose-500 selection:text-white">
      <Navbar />
      <main className="flex-1" id="main-content">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route
              path="/"
              element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <EventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id"
              element={
                <ProtectedRoute>
                  <EventDetailPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
