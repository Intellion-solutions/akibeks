import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/ui/loading-spinner';

// Layout Components
const Layout = React.lazy(() => import('@/components/layout/Layout'));
const AdminLayout = React.lazy(() => import('@/components/admin/AdminLayout'));

// Public Pages
const Index = React.lazy(() => import('@/pages/Index'));
const About = React.lazy(() => import('@/pages/About'));
const Services = React.lazy(() => import('@/pages/Services'));
const Portfolio = React.lazy(() => import('@/pages/Portfolio'));
const CaseStudies = React.lazy(() => import('@/pages/CaseStudies'));
const Innovation = React.lazy(() => import('@/pages/Innovation'));
const Sustainability = React.lazy(() => import('@/pages/Sustainability'));
const Contact = React.lazy(() => import('@/pages/Contact'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

// Admin Pages
const AdminLogin = React.lazy(() => import('@/pages/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminProjects = React.lazy(() => import('@/pages/admin/AdminProjects'));
const AdminServices = React.lazy(() => import('@/pages/admin/AdminServices'));
const AdminUsers = React.lazy(() => import('@/pages/admin/AdminUsers'));
const AdminSettings = React.lazy(() => import('@/pages/admin/AdminSettings'));
const AdminSEO = React.lazy(() => import('@/pages/admin/AdminSEO'));

// Configure React Query with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

// Public route wrapper
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    <Layout>{children}</Layout>
  </Suspense>
);

// Admin route wrapper
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    <AdminLayout>{children}</AdminLayout>
  </Suspense>
);

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="light" storageKey="akibeks-theme">
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
                <Route path="/about" element={<PublicRoute><About /></PublicRoute>} />
                <Route path="/services" element={<PublicRoute><Services /></PublicRoute>} />
                <Route path="/portfolio" element={<PublicRoute><Portfolio /></PublicRoute>} />
                <Route path="/case-studies" element={<PublicRoute><CaseStudies /></PublicRoute>} />
                <Route path="/innovation" element={<PublicRoute><Innovation /></PublicRoute>} />
                <Route path="/sustainability" element={<PublicRoute><Sustainability /></PublicRoute>} />
                <Route path="/contact" element={<PublicRoute><Contact /></PublicRoute>} />
                
                {/* Admin Login (no layout) */}
                <Route path="/admin/login" element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminLogin />
                  </Suspense>
                } />
                
                {/* Admin Routes with Layout */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/projects" element={<AdminRoute><AdminProjects /></AdminRoute>} />
                <Route path="/admin/services" element={<AdminRoute><AdminServices /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/seo" element={<AdminRoute><AdminSEO /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
                
                {/* 404 Not Found */}
                <Route path="*" element={<PublicRoute><NotFound /></PublicRoute>} />
              </Routes>
              <Toaster />
            </Router>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
