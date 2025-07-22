import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminProvider } from './contexts/AdminContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Layout component
import Layout from './components/layout/Layout';

// Public pages
import Index from './pages/Index';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import CaseStudies from './pages/CaseStudies';
import Innovation from './pages/Innovation';
import Sustainability from './pages/Sustainability';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProjects from './pages/admin/AdminProjects';
import AdminServices from './pages/admin/AdminServices';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminInvoices from './pages/admin/AdminInvoices';
import AdminQuotations from './pages/admin/AdminQuotations';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFileManager from './pages/admin/AdminFileManager';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AdminProvider>
          <Router>
            <Routes>
              {/* Public routes with Layout (header and footer) */}
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/services" element={<Layout><Services /></Layout>} />
              <Route path="/about" element={<Layout><About /></Layout>} />
              <Route path="/contact" element={<Layout><Contact /></Layout>} />
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
            </Routes>
          </Router>
        </AdminProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
