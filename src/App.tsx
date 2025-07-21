import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AdminProvider } from "@/contexts/AdminContext";
import React from "react";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProjects from "@/pages/admin/AdminProjects";
import AdminInvoices from "@/pages/admin/AdminInvoices";
import AdminClients from "@/pages/admin/AdminClients";
import AdminServices from "@/pages/admin/AdminServices";
import AdminTemplates from "@/pages/admin/AdminTemplates";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminReports from "@/pages/admin/AdminReports";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminInventory from "@/pages/admin/AdminInventory";
import AdminTasks from "@/pages/admin/AdminTasks";
import AdminDocuments from "@/pages/admin/AdminDocuments";
import AdminLetterheads from "@/pages/admin/AdminLetterheads";
import AdminBackup from "@/pages/admin/AdminBackup";
import AdminTestimonials from "@/pages/admin/AdminTestimonials";
import AdminQuotations from "@/pages/admin/AdminQuotations";
import AdminPersonnel from "@/pages/admin/AdminPersonnel";
import AdminCalendar from "@/pages/admin/AdminCalendar";
import AdminFileManager from "@/pages/admin/AdminFileManager";

// Public Pages
import Index from "@/pages/Index";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Projects from "@/pages/Projects";
import Portfolio from "@/pages/Portfolio";
import Contact from "@/pages/Contact";
import RequestQuote from "@/pages/RequestQuote";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Careers from "@/pages/Careers";
import Career from "@/pages/Career";
import Team from "@/pages/Team";
import Testimonials from "@/pages/Testimonials";
import FAQ from "@/pages/FAQ";
import Gallery from "@/pages/Gallery";
import Resources from "@/pages/Resources";
import News from "@/pages/News";
import CaseStudies from "@/pages/CaseStudies";
import Industries from "@/pages/Industries";
import Features from "@/pages/Features";
import Pricing from "@/pages/Pricing";
import Solutions from "@/pages/Solutions";
import BookVisit from "@/pages/BookVisit";
import ServiceDetail from "@/pages/ServiceDetail";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/NotFound";
import SubmitTestimonial from "@/pages/SubmitTestimonial";
import MilestoneViewer from "@/pages/MilestoneViewer";
import CreateProject from "@/pages/CreateProject";
import AdminAccess from "@/pages/AdminAccess";
import InvoiceManagement from "@/pages/InvoiceManagement";
import QuotationManagement from "@/pages/QuotationManagement";
import ProjectTracking from "@/pages/ProjectTracking";
import ProjectDashboard from "@/pages/ProjectDashboard";
import ClientPortal from "@/pages/ClientPortal";

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AdminProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:serviceId" element={<ServiceDetail />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/quote" element={<RequestQuote />} />
                <Route path="/request-quote" element={<RequestQuote />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/careers/:id" element={<Career />} />
                <Route path="/team" element={<Team />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/news" element={<News />} />
                <Route path="/case-studies" element={<CaseStudies />} />
                <Route path="/industries" element={<Industries />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/solutions" element={<Solutions />} />
                <Route path="/book-visit" element={<BookVisit />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/submit-testimonial" element={<SubmitTestimonial />} />
                
                {/* Project Related Public Routes */}
                <Route path="/milestone/:id" element={<MilestoneViewer />} />
                <Route path="/create-project" element={<CreateProject />} />
                
                {/* Access Routes */}
                <Route path="/admin-access" element={<AdminAccess />} />
                
                {/* Client Portal Routes */}
                <Route path="/client-portal" element={<ClientPortal />} />
                <Route path="/client" element={<ClientPortal />} />
                <Route path="/client/invoices" element={<InvoiceManagement />} />
                <Route path="/client/quotations" element={<QuotationManagement />} />
                <Route path="/client/projects" element={<ProjectTracking />} />
                <Route path="/client/dashboard" element={<ProjectDashboard />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/projects" element={<AdminProjects />} />
                <Route path="/admin/invoices" element={<AdminInvoices />} />
                <Route path="/admin/quotations" element={<AdminQuotations />} />
                <Route path="/admin/clients" element={<AdminClients />} />
                <Route path="/admin/services" element={<AdminServices />} />
                <Route path="/admin/templates" element={<AdminTemplates />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/inventory" element={<AdminInventory />} />
                <Route path="/admin/tasks" element={<AdminTasks />} />
                <Route path="/admin/documents" element={<AdminDocuments />} />
                <Route path="/admin/letterheads" element={<AdminLetterheads />} />
                <Route path="/admin/backup" element={<AdminBackup />} />
                <Route path="/admin/testimonials" element={<AdminTestimonials />} />
                <Route path="/admin/personnel" element={<AdminPersonnel />} />
                <Route path="/admin/calendar" element={<AdminCalendar />} />
                <Route path="/admin/files" element={<AdminFileManager />} />
                
                {/* 404 Page - Must be last */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AdminProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);

export default App;
