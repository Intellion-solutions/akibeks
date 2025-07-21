
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dbClient, Tables } from '@/core/database-client';
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
      const result = await dbClient.findOne(Tables.users, { 
        email: email.toLowerCase(),
        isActive: true 
      });

      if (result.error || !result.data) {
        throw new Error('Invalid credentials');
      }

      const userData = result.data as User;
      
      // In a real implementation, you would verify the password here
      // For now, we'll just check if the user exists and is an admin
      if (userData.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      setUser(userData);
      
      // Update last login time
      await dbClient.update(Tables.users, userData.id, {
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
      // Get project statistics
      const [
        totalProjectsResult,
        activeProjectsResult,
        totalClientsResult
      ] = await Promise.all([
        dbClient.count(Tables.projects),
        dbClient.count(Tables.projects, [{ column: 'status', operator: 'eq', value: 'active' }]),
        dbClient.count(Tables.users, [{ column: 'role', operator: 'eq', value: 'client' }])
      ]);

      // Get revenue data (assuming projects have budgetKes field)
      const projectsResult = await dbClient.select(Tables.projects, {
        filters: [{ column: 'status', operator: 'in', value: ['active', 'completed'] }]
      });

      let totalRevenue = 0;
      let monthlyRevenue = 0;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      if (projectsResult.data) {
        totalRevenue = projectsResult.data.reduce((sum: number, project: any) => {
          return sum + (parseFloat(project.budgetKes) || 0);
        }, 0);

        monthlyRevenue = projectsResult.data
          .filter((project: any) => {
            const projectDate = new Date(project.createdAt);
            return projectDate.getMonth() === currentMonth && 
                   projectDate.getFullYear() === currentYear;
          })
          .reduce((sum: number, project: any) => {
            return sum + (parseFloat(project.budgetKes) || 0);
          }, 0);
      }

      // Calculate overdue projects
      const overdueProjectsResult = await dbClient.select(Tables.projects, {
        filters: [
          { column: 'status', operator: 'eq', value: 'active' },
          { column: 'endDate', operator: 'lt', value: new Date().toISOString() }
        ]
      });

      setStats({
        totalProjects: totalProjectsResult.data || 0,
        activeProjects: activeProjectsResult.data || 0,
        totalClients: totalClientsResult.data || 0,
        totalRevenue,
        pendingTasks: 0, // TODO: Implement tasks table
        completedTasks: 0, // TODO: Implement tasks table
        overdueProjects: overdueProjectsResult.data?.length || 0,
        monthlyRevenue,
      });
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
