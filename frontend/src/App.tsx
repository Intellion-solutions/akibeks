import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AdminProvider } from './contexts/AdminContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/ui/loading-spinner';

// Lazy load public pages for better performance
const Index = lazy(() => import('./pages/Index'));
const Services = lazy(() => import('./pages/Services'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));
const Innovation = lazy(() => import('./pages/Innovation'));
const Sustainability = lazy(() => import('./pages/Sustainability'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy load admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminCalendar = lazy(() => import('./pages/admin/AdminCalendar'));
const AdminInvoices = lazy(() => import('./pages/admin/AdminInvoices'));
const AdminQuotations = lazy(() => import('./pages/admin/AdminQuotations'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminFileManager = lazy(() => import('./pages/admin/AdminFileManager'));
const AdminSEO = lazy(() => import('./pages/admin/AdminSEO'));

// Configure React Query with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AdminProvider>
            <Router>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public routes with Layout (header and footer) */}
                  <Route path="/" element={<Layout><Index /></Layout>} />
                  <Route path="/services" element={<Layout><Services /></Layout>} />
                  <Route path="/about" element={<Layout><About /></Layout>} />
                  <Route path="/contact" element={<Layout><Contact /></Layout>} />
                  <Route path="/portfolio" element={<Layout><Portfolio /></Layout>} />
                  <Route path="/case-studies" element={<Layout><CaseStudies /></Layout>} />
                  <Route path="/innovation" element={<Layout><Innovation /></Layout>} />
                  <Route path="/sustainability" element={<Layout><Sustainability /></Layout>} />
                  
                  {/* Admin routes without Layout (separate admin interface) */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/projects" element={<AdminProjects />} />
                  <Route path="/admin/services" element={<AdminServices />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="/admin/calendar" element={<AdminCalendar />} />
                  <Route path="/admin/invoices" element={<AdminInvoices />} />
                  <Route path="/admin/quotations" element={<AdminQuotations />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/files" element={<AdminFileManager />} />
                  <Route path="/admin/seo" element={<AdminSEO />} />
                  
                  {/* 404 Not Found route */}
                  <Route path="*" element={<Layout><NotFound /></Layout>} />
                </Routes>
              </Suspense>
            </Router>
          </AdminProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
