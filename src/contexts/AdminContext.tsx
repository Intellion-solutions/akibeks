
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import DatabaseClient, { Tables } from "@/core/database/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface CompanySettings {
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  registrationNumber?: string;
  logoUrl?: string;
  description?: string;
  currencySymbol?: string;
  taxRate?: number;
  paymentTerms?: string;
  invoicePrefix?: string;
  quotePrefix?: string;
  emailNotifications?: boolean;
  projectUpdates?: boolean;
  paymentReminders?: boolean;
  quoteExpiryAlerts?: boolean;
  systemMaintenance?: boolean;
  timezone?: string;
  dateFormat?: string;
  language?: string;
  backupFrequency?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  budgetKes: string;
  clientId?: string;
  location: string;
  completionPercentage: number;
  createdAt: string;
}

interface AdminStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalClients: number;
  totalRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  recentActivities: ActivityLog[];
}

interface ActivityLog {
  id: string;
  action: string;
  resource?: string;
  details: Record<string, any>;
  createdAt: string;
  userId?: string;
}

interface AdminContextType {
  user: User | null;
  loading: boolean;
  companySettings: CompanySettings;
  stats: AdminStats;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateSettings: (settings: Partial<CompanySettings>) => Promise<boolean>;
  refreshStats: () => Promise<void>;
  isAuthenticated: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [companySettings, setCompanySettings] = useState<CompanySettings>({});
  const [stats, setStats] = useState<AdminStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalClients: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    recentActivities: []
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const isAuthenticated = Boolean(user);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Validate token with backend (this would need to be implemented)
      // For now, we'll just check if token exists
      const userData = localStorage.getItem('admin_user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        await loadCompanySettings();
        await refreshStats();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Find user by email
      const { data: userData, error: userError } = await DatabaseClient.findOne<User>(
        Tables.users,
        { email, isActive: true }
      );

      if (userError || !userData) {
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
        return false;
      }

      // In a real implementation, you would verify the password here
      // For now, we'll just check if the user exists and has admin role
      if (userData.role !== 'admin' && userData.role !== 'super_admin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin panel",
          variant: "destructive",
        });
        return false;
      }

      // Store user and token
      const token = `admin_token_${Date.now()}`; // In real app, use proper JWT
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      
      setUser(userData);
      await loadCompanySettings();
      await refreshStats();

      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.firstName}!`,
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
    setCompanySettings({});
    setStats({
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalClients: 0,
      totalRevenue: 0,
      pendingInvoices: 0,
      overdueInvoices: 0,
      recentActivities: []
    });
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    navigate('/admin/login');
  };

  const loadCompanySettings = async () => {
    try {
      // In a real implementation, you would load from a settings table
      // For now, using localStorage as fallback
      const savedSettings = localStorage.getItem('company_settings');
      if (savedSettings) {
        setCompanySettings(JSON.parse(savedSettings));
      } else {
        // Set default settings
        const defaultSettings: CompanySettings = {
          companyName: 'AKIBEKS Engineering Solutions',
          email: 'info@akibeks.co.ke',
          phone: '+254 710 245 118',
          address: 'Westlands, Nairobi, Kenya',
          currencySymbol: 'KES',
          taxRate: 16, // 16% VAT in Kenya
          timezone: 'Africa/Nairobi',
          language: 'en',
          dateFormat: 'DD/MM/YYYY'
        };
        setCompanySettings(defaultSettings);
        localStorage.setItem('company_settings', JSON.stringify(defaultSettings));
      }
    } catch (error) {
      console.error('Error loading company settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<CompanySettings>): Promise<boolean> => {
    try {
      const updatedSettings = { ...companySettings, ...newSettings };
      setCompanySettings(updatedSettings);
      localStorage.setItem('company_settings', JSON.stringify(updatedSettings));
      
      // In a real implementation, save to database here
      
      toast({
        title: "Settings Updated",
        description: "Company settings have been updated successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const refreshStats = async () => {
    try {
      // Get project stats
      const { data: allProjects } = await DatabaseClient.select<Project>(Tables.projects, {});
      const projects = allProjects || [];
      
      const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in_progress').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      
      // Get client stats
      const { data: allUsers } = await DatabaseClient.select<User>(Tables.users, {
        filters: [{ column: 'role', operator: 'ne', value: 'admin' }]
      });
      const clients = allUsers || [];
      
      // Calculate revenue (sum of completed project budgets)
      const totalRevenue = projects
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.budgetKes || '0'), 0);

      // Get recent activities
      const { data: activities } = await DatabaseClient.select<ActivityLog>(Tables.activityLogs, {
        limit: 10,
        orderBy: 'createdAt',
        orderDirection: 'desc'
      });

      setStats({
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        totalClients: clients.length,
        totalRevenue,
        pendingInvoices: 0, // Would need invoice table
        overdueInvoices: 0, // Would need invoice table
        recentActivities: activities || []
      });
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  const value: AdminContextType = {
    user,
    loading,
    companySettings,
    stats,
    login,
    logout,
    updateSettings,
    refreshStats,
    isAuthenticated,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
