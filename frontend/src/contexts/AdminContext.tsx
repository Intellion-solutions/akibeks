
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import { db, User as DatabaseUser, withFallback } from '@/lib/database';

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

interface AdminStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalClients: number;
  totalRevenue: number;
  pendingTasks: number;
  completedTasks: number;
  overdueProjects: number;
  monthlyRevenue: number;
}

export interface AdminContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshStats: () => Promise<void>;
  stats: AdminStats;
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
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalProjects: 24,
    activeProjects: 12,
    completedProjects: 8,
    totalClients: 45,
    totalRevenue: 125000000,
    pendingTasks: 18,
    completedTasks: 156,
    overdueProjects: 3,
    monthlyRevenue: 4100000,
  });

  const { toast } = useToast();

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Try real authentication first, fallback to demo credentials
      const result = await withFallback(
        () => db.authenticate(email, password),
        // Demo fallback
        email === 'admin@akibeks.co.ke' && password === 'admin123' 
          ? {
              user: {
                id: '1',
                email: email,
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin' as const,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              token: 'demo-token'
            }
          : null
      );

      if (!result.success || !result.data) {
        throw new Error('Invalid credentials');
      }

      const { user: dbUser, token } = result.data;
      
      // Convert database user to local user format
      const userData: User = {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
        isActive: dbUser.isActive,
        createdAt: dbUser.createdAt,
        lastLoginAt: new Date().toISOString(),
      };

      setUser(userData);
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      
      await refreshStats();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  const refreshStats = async () => {
    try {
      const result = await withFallback(
        () => db.getDashboardStats(),
        {
          totalProjects: 24,
          activeProjects: 12,
          completedProjects: 8,
          totalUsers: 45,
          totalRevenue: 125000000,
          monthlyRevenue: 4100000,
        }
      );

      if (result.success && result.data) {
        setStats({
          totalProjects: result.data.totalProjects,
          activeProjects: result.data.activeProjects,
          completedProjects: result.data.completedProjects,
          totalClients: result.data.totalUsers,
          totalRevenue: result.data.totalRevenue,
          pendingTasks: 18, // These would come from a separate endpoint
          completedTasks: 156,
          overdueProjects: 3,
          monthlyRevenue: result.data.monthlyRevenue,
        });
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  const isAuthenticated = !!user && !!localStorage.getItem('admin_token');

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        refreshStats();
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        logout();
      }
    }
  }, []);

  const value: AdminContextType = {
    user,
    loading,
    isAuthenticated,
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
