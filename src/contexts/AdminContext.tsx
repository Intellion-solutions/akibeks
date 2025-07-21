
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "@/lib/db-client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface CompanySettings {
  company_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  tax_id?: string;
  registration_number?: string;
  logo_url?: string;
  description?: string;
  currency_symbol?: string;
  tax_rate?: number;
  payment_terms?: string;
  invoice_prefix?: string;
  quote_prefix?: string;
  email_notifications?: boolean;
  project_updates?: boolean;
  payment_reminders?: boolean;
  quote_expiry_alerts?: boolean;
  system_maintenance?: boolean;
  timezone?: string;
  date_format?: string;
  language?: string;
  backup_frequency?: string;
  auto_archive?: boolean;
  two_factor_auth?: boolean;
  session_timeout?: number;
  password_policy?: string;
  login_attempts?: number;
  ip_restrictions?: boolean;
  theme?: string;
  primary_color?: string;
  sidebar_collapsed?: boolean;
  compact_mode?: boolean;
  show_animations?: boolean;
}

interface AdminContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  companySettings: CompanySettings;
  loadCompanySettings: () => Promise<void>;
  updateCompanySettings: (settings: Partial<CompanySettings>) => Promise<void>;
  loginAttempts: number;
  isLocked: boolean;
  sessionExpiry: Date | null;
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

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const SESSION_DURATION = 60 * 60 * 1000; // 1 hour

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [companySettings, setCompanySettings] = useState<CompanySettings>({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const { toast } = useToast();
  const navigate = useNavigate();

  // Activity tracking for session management
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, []);

  // Session timeout monitoring
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      
      if (timeSinceActivity > SESSION_DURATION) {
        logout();
        toast({
          title: "Session Expired",
          description: "Your session has expired due to inactivity.",
          variant: "destructive"
        });
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity]);

  // Check lockout status
  useEffect(() => {
    const lockoutEnd = localStorage.getItem('admin_lockout_end');
    if (lockoutEnd) {
      const lockoutEndTime = parseInt(lockoutEnd);
      if (Date.now() < lockoutEndTime) {
        setIsLocked(true);
        const attempts = localStorage.getItem('admin_login_attempts');
        setLoginAttempts(attempts ? parseInt(attempts) : 0);
      } else {
        // Clear expired lockout
        localStorage.removeItem('admin_lockout_end');
        localStorage.removeItem('admin_login_attempts');
        setIsLocked(false);
        setLoginAttempts(0);
      }
    }
  }, []);

  const loadCompanySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*');

      if (error) throw error;

      const settingsObj: CompanySettings = {};
      data?.forEach((setting) => {
        const key = setting.setting_key as keyof CompanySettings;
        let value: any = setting.setting_value;
        
        if (key === 'tax_rate' || key === 'session_timeout' || key === 'login_attempts') {
          value = parseFloat(value) || 0;
        } else if (['email_notifications', 'project_updates', 'payment_reminders', 'quote_expiry_alerts', 'system_maintenance', 'auto_archive', 'two_factor_auth', 'ip_restrictions', 'sidebar_collapsed', 'compact_mode', 'show_animations'].includes(key)) {
          value = value === 'true';
        }
        
        (settingsObj as any)[key] = value;
      });

      setCompanySettings(settingsObj);
    } catch (error) {
      console.error('Error loading company settings:', error);
      toast({
        title: "Error",
        description: "Failed to load company settings",
        variant: "destructive"
      });
    }
  };

  const updateCompanySettings = async (settings: Partial<CompanySettings>) => {
    try {
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: String(value),
      }));

      for (const setting of settingsArray) {
        const { error } = await supabase
          .from('company_settings')
          .upsert(setting, { onConflict: 'setting_key' });

        if (error) throw error;
      }

      await loadCompanySettings();

      toast({
        title: "Settings Updated",
        description: "Company settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating company settings:', error);
      toast({
        title: "Error",
        description: "Failed to update company settings",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const authStatus = localStorage.getItem('admin_authenticated');
    const sessionExpiryStr = localStorage.getItem('admin_session_expiry');
    
    if (authStatus === 'true' && sessionExpiryStr) {
      const expiryDate = new Date(sessionExpiryStr);
      if (expiryDate > new Date()) {
        setIsAuthenticated(true);
        setSessionExpiry(expiryDate);
        loadCompanySettings();
      } else {
        // Session expired
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_session_expiry');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check if locked out
    if (isLocked) {
      const lockoutEnd = localStorage.getItem('admin_lockout_end');
      if (lockoutEnd) {
        const remainingTime = Math.ceil((parseInt(lockoutEnd) - Date.now()) / 60000);
        toast({
          title: "Account Locked",
          description: `Too many failed attempts. Try again in ${remainingTime} minutes.`,
          variant: "destructive"
        });
        return false;
      }
    }

    // Check credentials
    if (email === 'admin@akibeks.com' && password === 'admin123') {
      // Reset login attempts on successful login
      setLoginAttempts(0);
      setIsLocked(false);
      localStorage.removeItem('admin_login_attempts');
      localStorage.removeItem('admin_lockout_end');
      
      // Set authentication
      setIsAuthenticated(true);
      const expiryDate = new Date(Date.now() + SESSION_DURATION);
      setSessionExpiry(expiryDate);
      
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_session_expiry', expiryDate.toISOString());
      
      await loadCompanySettings();
      
      // Log successful login
      console.log(`Admin login successful at ${new Date().toISOString()}`);
      
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel!",
      });
      
      return true;
    } else {
      // Handle failed login
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('admin_login_attempts', newAttempts.toString());
      
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutEnd = Date.now() + LOCKOUT_DURATION;
        setIsLocked(true);
        localStorage.setItem('admin_lockout_end', lockoutEnd.toString());
        
        toast({
          title: "Account Locked",
          description: `Too many failed attempts. Account locked for 15 minutes.`,
          variant: "destructive"
        });
      } else {
        const remainingAttempts = MAX_LOGIN_ATTEMPTS - newAttempts;
        toast({
          title: "Login Failed",
          description: `Invalid credentials. ${remainingAttempts} attempts remaining.`,
          variant: "destructive"
        });
      }
      
      // Log failed login attempt
      console.warn(`Failed admin login attempt at ${new Date().toISOString()} - Email: ${email}`);
      
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setSessionExpiry(null);
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_session_expiry');
    setCompanySettings({});
    
    // Log logout
    console.log(`Admin logout at ${new Date().toISOString()}`);
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    navigate('/admin-access');
  };

  return (
    <AdminContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      companySettings,
      loadCompanySettings,
      updateCompanySettings,
      loginAttempts,
      isLocked,
      sessionExpiry
    }}>
      {children}
    </AdminContext.Provider>
  );
};
