
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { clientDb as dbClient } from '@/lib/client-db';
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

export interface AdminContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshStats: () => Promise<void>;
  stats: {
    totalProjects: number;
    activeProjects: number;
    totalClients: number;
    totalRevenue: number;
    pendingTasks: number;
    completedTasks: number;
    overdueProjects: number;
    monthlyRevenue: number;
  };
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalClients: 0,
    totalRevenue: 0,
    pendingTasks: 0,
    completedTasks: 0,
    overdueProjects: 0,
    monthlyRevenue: 0,
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    try {
      // Use the new database client for authentication
      const result = await dbClient.authenticate(email, password);

      if (!result.success || !result.data) {
        throw new Error('Invalid credentials');
      }

      const userData = result.data as User;
      
      // Check if the user is an admin
      if (userData.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      setUser(userData);
      
      // Update last login time
      await dbClient.update('users', userData.id, {
        lastLoginAt: new Date()
      });

      // Refresh stats after login
      await refreshStats();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    // Clear any stored authentication tokens if using them
  };

  const refreshStats = async () => {
    try {
      // Use the new database client for fetching stats
      const result = await dbClient.getDashboardStats();

      if (result.success && result.data) {
        setStats({
          totalProjects: result.data.totalProjects || 0,
          activeProjects: result.data.activeProjects || 0,
          totalClients: result.data.totalUsers || 0,
          totalRevenue: 15000000, // Mock data - KES
          pendingTasks: 8, // Mock data
          completedTasks: 24, // Mock data
          overdueProjects: 2, // Mock data
          monthlyRevenue: 2500000, // Mock data - KES
        });
      } else {
        throw new Error(result.error || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  useEffect(() => {
    // Check for existing session or stored auth token
    const initializeAuth = async () => {
      try {
        // TODO: Implement session/token validation
        // For now, we'll just set loading to false
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      refreshStats();
    }
  }, [user]);

  const value: AdminContextType = {
    user,
    loading,
    login,
    logout,
    refreshStats,
    stats,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}
